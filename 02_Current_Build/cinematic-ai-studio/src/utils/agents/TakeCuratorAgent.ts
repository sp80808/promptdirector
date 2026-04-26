/**
 * TakeCuratorAgent — AI-powered take quality assessment & ranking
 * 
 * Analyzes rendered takes and scores them on multiple cinematic dimensions:
 * - Composition (rule of thirds, framing, balance)
 * - Prompt adherence (does image match shot description?)
 * - Technical quality (blur, artifacts, noise)
 * - Continuity (consistency with previous approved take)
 * 
 * Returns a confidence-adjusted score (0-10) and recommendation tier.
 * 
 * Integration: automatically adds suggestion to auto-approve if score exceeds threshold.
 */

import { Agent, AgentContext, AgentResult } from './base';
import { GoogleGenAI } from '@google/genai';
import type { Take, Shot } from '@/types';
  composition: number;      // 0-10: framing, balance, rule of thirds
  adherence: number;        // 0-10: matches prompt description
  technical: number;        // 0-10: sharpness, artifacts, noise
  continuity: number;       // 0-10: matches previous approved take
  overall: number;          // weighted total
  breakdown: string;        // human-readable explanation
};

export class TakeCuratorAgent extends Agent {
  private gemini: GoogleGenAI | null = null;

  constructor() {
    super(
      "take-curator",
      "Take Curator",
      "Ranks takes by cinematic quality and recommends best one",
      { enabled: true, confidenceThreshold: 0.7, minScoreToAutoApprove: 8.5 }
    );
  }

  isApplicable(context: AgentContext): boolean {
    const { shot, store } = context;
    if (!shot || !store.automationConfig?.autoApproval?.enabled) {
      // Even if auto-approval disabled, we still want to score takes for UI badge
      // Only skip if no takes at all
    }
    
    // Only run when shot has newly rendered takes (status === "rendered")
    const hasNewRendered = shot.takes.some(t => t.status === "rendered" && !t.metadata?.qualityScore);
    if (!hasNewRendered) return false;

    return true;
  }

  async process(context: AgentContext): Promise<AgentResult[]> {
    const { shot, apiKey, store } = context;
    if (!apiKey) return [];

    const results: AgentResult[] = [];

    for (const take of shot.takes) {
      if (take.status !== "rendered") continue;
      if (take.metadata?.qualityScore !== undefined) continue; // already scored

      // Need thumbnail or full image URL
      const imageUrl = take.thumbUrl || take.fullImageUrl;
      if (!imageUrl) continue;

      try {
        const metrics = await this.scoreTake(shot, take, imageUrl, apiKey);
        
        // Store metrics in take metadata
        const update: any = { metadata: { ...take.metadata, qualityScore: metrics.overall } };
        // Also update store - but we can't directly from agent, so we'll emit suggestion
        // The engine will handle the store update separately
        
        results.push({
          agentId: this.id,
          shotId: shot.id,
          type: "take_rating",
          original: "", // no original value
          suggested: JSON.stringify(metrics),
          confidence: 0.85, // LLM-based scoring is reasonably confident
          reason: `Quality: ${metrics.overall.toFixed(1)}/10 — ${metrics.breakdown}`,
          metadata: { metrics, takeId: take.id }
        } as any);
      } catch (err) {
        console.error(`[TakeCurator] Failed to score take ${take.id}:`, err);
      }
    }

    return results;
  }

  private async scoreTake(
    shot: import("../types").Shot,
    take: import("../types").Take,
    imageUrl: string,
    apiKey: string
  ): Promise<QualityMetrics> {
    if (!this.gemini) {
      this.gemini = new GoogleGenAI({ apiKey });
    }

    // Build prompt for GeminiVision
    const systemPrompt = `You are a professional film quality assessor.
Analyze the provided image against the shot description.
Score each dimension 0-10 (10 = perfect).

Output ONLY valid JSON:
{
  "composition": number,
  "adherence": number,
  "technical": number,
  "continuity": number,
  "breakdown": "One-sentence summary of strengths/weaknesses"
}

Guidelines:
- Composition: Rule of thirds, balance, framing, camera angle appropriateness
- Adherence: How well image matches the shot description (character, emotion, action)
- Technical: Sharpness, absence of artifacts, noise, blur, compression
- Continuity: If there's a previous approved take in this scene, how consistent is this take? (If no previous, rate 10)

Be strict. 5/10 is average, 8+ is excellent.`;

    const userPrompt = `
Shot Description: "${shot.rawPrompt}"
Optics: ${shot.optics || 'Not specified'}
Motion: ${shot.motion || 'Not specified'}

Assess this rendered take.`;

    try {
      // Note: Gemini Vision needs the image as part of message
      const response = await this.gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: userPrompt },
              { 
                file_data: {
                  file_name: 'take_image',
                  mime_type: 'image/jpeg',
                  file_uri: imageUrl
                }
              }
            ]
          }
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        config: { temperature: 0.2, maxOutputTokens: 256 }
      });

      const text = response.text();
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      } else if (text.includes('```')) {
        jsonStr = text.match(/```\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      }

      const parsed = JSON.parse(jsonStr);
      
      // Clamp scores to 0-10
      const clamp = (v: number) => Math.max(0, Math.min(10, v));
      const composition = clamp(parsed.composition ?? 5);
      const adherence = clamp(parsed.adherence ?? 5);
      const technical = clamp(parsed.technical ?? 5);
      const continuity = clamp(parsed.continuity ?? 5);

      // Weighted score: adherence most important, then composition, technical, continuity
      const overall = (
        adherence * 0.35 +
        composition * 0.25 +
        technical * 0.25 +
        continuity * 0.15
      );

      return {
        composition,
        adherence,
        technical,
        continuity,
        overall: Math.round(overall * 10) / 10,
        breakdown: parsed.breakdown || "No assessment available"
      };
    } catch (err: any) {
      console.error('[TakeCurator] Vision API error:', err.message);
      // Fallback: return neutral scores
      return {
        composition: 5, adherence: 5, technical: 5, continuity: 5,
        overall: 5.0,
        breakdown: "Scoring failed - manual review recommended"
      };
    }
  }
}
