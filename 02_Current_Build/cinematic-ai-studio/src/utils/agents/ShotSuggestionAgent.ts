/**
 * ShotSuggestionAgent — Recommends next coverage shots based on current scene context
 * 
 * Analyzes the current shot and scene to suggest logical follow-up shots:
 * - Dialogue scenes → OTS, reaction shots, coverage
 * - Action scenes → wide, insert, detail shots
 * - Monologues → CU, MS, WS progression
 * 
 * Suggests: shot type, optics, motion, and prompt fragment.
 * Integrates with existing `generateSmartCoverage` LLM service for backend logic.
 */

import { Agent, AgentContext, AgentResult } from './base';
import { GoogleGenAI } from '@google/genai';
import type { Shot, Scene } from '@/types';

export class ShotSuggestionAgent extends Agent {
  private gemini: GoogleGenAI | null = null;

  constructor() {
    super(
      "shot-suggester",
      "Shot Suggester",
      "Recommends next coverage shots based on scene context",
      { enabled: true, confidenceThreshold: 0.75, maxSuggestions: 3 }
    );
  }

  isApplicable(context: AgentContext): boolean {
    const { shot, store } = context;
    if (!shot) return false;
    
    // Only suggest for the currently selected shot
    if (store.selectedShotId !== shot.id) return false;
    
    const cfg = store.automationConfig?.shotSuggester;
    if (!cfg?.enabled) return false;
    
    // Skip if prompt too short (no context to analyze)
    if (shot.rawPrompt.trim().length < 10) return false;
    
    return true;
  }

  async process(context: AgentContext): Promise<AgentResult[]> {
    const { shot, characters, locations, apiKey, store } = context;
    if (!apiKey) return [];

    // Build character context
    const charInfos = shot.characterIds.map(cid => {
      const c = characters.find(ch => ch.id === cid);
      return c ? `${c.displayName} (@${c.name})` : null;
    }).filter(Boolean) as string[];

    // Analyze scene position
    const scene = store.scenes.find(s => s.id === shot.sceneId);
    const shotIndexInScene = scene?.shotIds.indexOf(shot.id) ?? 0;
    const isLastShotInScene = scene ? shotIndexInScene === scene.shotIds.length - 1 : false;
    
    // Determine scene context
    const sceneContext = this.categorizeScene(shot, charInfos.length);

    // Build prompt for Gemini
    const systemPrompt = `You are a professional film director and coverage specialist.
Given the current shot, suggest 2-3 logical next shots that complete the cinematic coverage.

Output STRICT JSON array:
[
  {
    "title": "OTS John",
    "shotType": "over_the_shoulder",
    "optics": "50mm prime",
    "motion": "static",
    "promptFragment": "Over the shoulder shot of John reacting, eyes wide",
    "reason": "Standard dialogue coverage - shows listener's reaction"
  }
]

Guidelines by scene type:
- DIALOGUE: Suggest OTS (both sides), CU reactions, wide master
- ACTION: Suggest wide context, insert details (hands, weapons), dynamic angles
- MONOLOGUE: Suggest CU, MS, WS variations; maybe insert on emotion
- REACTION: Suggest wider shot showing context; reverse angle

Be specific but concise. Prefer practical, production-tested coverage patterns.`;

    const userPrompt = `Current shot analysis:

Title: "${shot.title}"
Description: "${shot.rawPrompt}"
Characters present: ${charInfos.join(', ') || 'None'}
Location: ${locations.find(l => l.id === shot.locationId)?.name || 'Unknown'}
Optics: ${shot.optics || 'Not specified'}
Motion: ${shot.motion || 'Not specified'}

Scene type: ${sceneContext}
Is this the last shot in the scene? ${isLastShotInScene ? 'YES (consider closing shot)' : 'NO'}

Suggest 2-3 logical next shots.`;

    try {
      if (!this.gemini) {
        this.gemini = new GoogleGenAI({ apiKey });
      }

      const response = await this.gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        config: { temperature: 0.3, maxOutputTokens: 512 }
      });

      const text = response.text();
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      } else if (text.includes('```')) {
        jsonStr = text.match(/```\s*([\s\S]*?)\s*```/)?.[1] ?? text;
      }

      const suggestions = JSON.parse(jsonStr) as Array<{
        title: string;
        shotType: string;
        optics: string;
        motion: string;
        promptFragment: string;
        reason: string;
      }>;

      const maxCount = this.config.maxSuggestions ?? 3;
      const limitedSuggestions = suggestions.slice(0, maxCount);

      return limitedSuggestions.map((s, idx): AgentResult => ({
        agentId: this.id,
        shotId: shot.id,
        type: "shot_suggestion",
        original: "",
        suggested: JSON.stringify(s),
        confidence: 0.8 - (idx * 0.05), // slight decay for later suggestions
        reason: s.reason || `Coverage suggestion: ${s.shotType}`,
        metadata: { suggestion: s, sceneContext }
      }));

    } catch (err: any) {
      console.error('[ShotSuggestionAgent]', err.message || err);
      return [];
    }
  }

  private categorizeScene(shot: Shot, charCount: number): string {
    const prompt = shot.rawPrompt.toLowerCase();
    
    // Check for dialogue markers
    if (prompt.includes('say') || prompt.includes('talk') || prompt.includes('speak') || prompt.includes('dialogue')) {
      return charCount >= 2 ? 'dialogue' : 'monologue';
    }
    
    // Check for action markers
    if (prompt.includes('run') || prompt.includes('fight') || prompt.includes('jump') || prompt.includes('chase')) {
      return 'action';
    }
    
    // Check for emotion markers
    if (prompt.includes('sad') || prompt.includes('cry') || prompt.includes('happy') || prompt.includes('laugh')) {
      return 'reaction';
    }
    
    return charCount >= 2 ? 'dialogue' : 'monologue';
  }
}
