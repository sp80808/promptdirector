/**
 * PromptEnhancerAgent — Expands brief shot prompts into rich cinematic descriptions
 * 
 * Uses Google Gemini to translate short director notes into technical,
 * model-ready prompts with proper cinematic terminology.
 * 
 * Example:
 *   Input:  "Sarah sad"
 *   Output: "Close-up portrait of Sarah, eyes glistening with unshed tears, 
 *            lower lip trembling subtly. Soft key lighting from above creating 
 *            gentle shadows, shallow depth of field. @Sarah_MASTER"
 */

import { Agent, AgentContext, AgentResult } from './base';
import { GoogleGenAI } from '@google/genai';
import type { Shot } from '@/types';

export class PromptEnhancerAgent extends Agent {
  private gemini: GoogleGenAI | null = null;

  constructor() {
    super(
      "prompt-enhancer",
      "Prompt Enhancer",
      "Expands shot prompts with cinematic detail and terminology",
      { enabled: true, confidenceThreshold: 0.7, level: "moderate" as const }
    );
  }

  isApplicable(context: AgentContext): boolean {
    const { shot, store } = context;
    if (!shot || !shot.rawPrompt.trim()) return false;
    
    // Check if user wants this agent
    const cfg = store.automationConfig?.promptEnhancer;
    if (!cfg?.enabled) return false;

    // Skip if prompt already lengthy (> 60 words) or already contains many commas (likely detailed)
    const wordCount = shot.rawPrompt.split(/\s+/).length;
    if (wordCount > 60) return false;

    return true;
  }

  async process(context: AgentContext): Promise<AgentResult[]> {
    const { shot, characters, locations, apiKey, store } = context;
    if (!apiKey) return [];

    const raw = shot.rawPrompt.trim();
    
    // Gather character + location context
    const charInfos = shot.characterIds.map(cid => 
      characters.find(c => c.id === cid)
    ).filter(Boolean) as any[];
    
    const location = shot.locationId 
      ? locations.find(l => l.id === shot.locationId) 
      : null;

    // Build context string for LLM
    const charContext = charInfos.map(c => 
      `@${c.name} (${c.displayName}): ${c.traits}`
    ).join('\n');

    const locContext = location 
      ? `${location.name} — ${location.description} (${location.timeOfDay}, ${location.lightingMood})`
      : "No location set";

    // Determine enhancement level
    const level = store.automationConfig?.promptEnhancer?.level || "moderate";

    const systemPrompt = this.buildSystemPrompt(level);
    const userPrompt = `
Shot description: "${raw}"

Characters:
${charContext || 'None'}

Location: ${locContext}

Current optics: ${shot.optics || 'Not specified'}
Current motion: ${shot.motion || 'Not specified'}

Enhance this description to professional cinematic prompt quality. Return JSON:
{
  "enhanced": "the full expanded prompt string",
  "confidence": 0.85,
  "changes": ["Added lens specification", "Expanded emotion", "Injected @mentions"]
}
`.trim();

    try {
      if (!this.gemini) {
        this.gemini = new GoogleGenAI({ apiKey });
      }

      const response = await this.gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        config: {
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      });

      const text = response.text();
      
      // Parse JSON response
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      } else if (text.includes('```')) {
        jsonStr = text.match(/```\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      }

      const parsed = JSON.parse(jsonStr);
      const enhanced = (parsed.enhanced || "").trim();
      
      if (!enhanced || enhanced === raw) {
        return [];
      }

      const confidence = parsed.confidence ?? 0.75;
      if (confidence < (this.config.confidenceThreshold ?? 0.6)) {
        return []; // low confidence, skip
      }

      return [{
        agentId: this.id,
        shotId: shot.id,
        type: "prompt_enhancement",
        original: raw,
        suggested: enhanced,
        confidence,
        reason: `Cinematic enhancement (${level}): ${(parsed.changes || []).join(', ')}`,
        metadata: { changes: parsed.changes || [], level }
      }];

    } catch (err: any) {
      console.error(`[PromptEnhancerAgent]`, err.message || err);
      return [];
    }
  }

  private buildSystemPrompt(level: "light" | "moderate" | "aggressive"): string {
    const base = `You are a professional film director's assistant specializing in AI video generation prompts.

Your task: transform rough shot descriptions into rich, technical prompts that maximize cinematic quality.

Principles:
- Preserve core action/emotion from original
- Never contradict the director's intent
- Use industry-standard terminology (e.g., "dolly in", "rack focus", "chiaroscuro")
- Mention characters using their @handle automatically if they're in shot
- Include lighting, lens, and movement contextually`;

    switch (level) {
      case "light":
        return base + `\n\nLIGHT ENHANCEMENT (minimal):
- Fix grammar/spelling
- Capitalize proper terms
- Add 1-2 key details (e.g. "35mm lens" if missing)
- Keep original length ~same`;
      case "aggressive":
        return base + `\n\nAGGRESSIVE ENHANCEMENT (full rewrite):
- Expand every implicit detail
- Add 3-5 cinematic elements per prompt
- Suggest camera angles, lighting setups, movement
- Inject mood descriptors (e.g., "tense", "ethereal")
- May re-order phrases for clarity`;
      case "moderate":
      default:
        return base + `\n\nMODERATE ENHANCEMENT (balanced):
- Add 2-3 key cinematic details
- Specify optics if missing (e.g., "Arri Alexa, 35mm anamorphic")
- Clarify motion (e.g., "slow push-in", "handheld")
- Expand emotion into physical tells (e.g., "trembling hands" for nervous)
- Keep concise (2-4 sentences)`;
    }
  }
}
