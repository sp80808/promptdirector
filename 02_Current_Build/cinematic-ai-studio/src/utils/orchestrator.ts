import { Shot, CinematicState, Character, Location, Prop } from "../types";

/**
 * Orchestrator translates the internal data structures of a Shot into a cohesive,
 * verbose prompt suitable for generation models like FLUX or SDXL.
 */
export class PromptOrchestrator {
  static buildGenerationPayload(shot: Shot, state: CinematicState): string {
    const segments: string[] = [];

    // 1. Core Action & Smart Prompt Mention resolution
    let actionPrompt = shot.rawPrompt;
    
    // Simple mock resolution: ideally this would map exact IDs, but here we replace tags 
    // with their full descriptions if they exist in the raw prompt.
    // In a real sophisticated system, we'd use the AST of the MentionTextarea.
    
    // We append the location details
    if (shot.locationId) {
      const loc = state.locations.find((l) => l.id === shot.locationId);
      if (loc) {
        segments.push(`[LOCATION]: ${loc.name}, ${loc.description}. Time of Day: ${loc.timeOfDay}. Mood: ${loc.lightingMood}.`);
      }
    }

    // 2. Character Resolution
    if (shot.characterIds && shot.characterIds.length > 0) {
      const charSegments = shot.characterIds.map((cid) => {
        const char = state.characters.find((c) => c.id === cid);
        if (!char) return null;

        const outfitId = shot.outfitIds[cid];
        const outfit = outfitId ? char.outfits.find((o) => o.id === outfitId) : null;
        const wardrobe = outfit ? outfit.clothingDesc : "casual clothes";
        
        return `[CHARACTER]: ${char.displayName}. Physical Traits: ${char.traits}. Wearing: ${wardrobe}.`;
      });
      segments.push(charSegments.filter(Boolean).join("\n"));
    }

    // 3. Optics and Camera
    if (shot.optics) {
      segments.push(`[CAMERA/OPTICS]: ${shot.optics}`);
    }
    if (shot.motion) {
      segments.push(`[MOTION]: ${shot.motion}`);
    }

    // 4. Main Directorial Action
    // Strip raw @ tags for the final prompt output to the model if they are standalone
    const cleanedPrompt = actionPrompt.replace(/@[\w_]+/g, '').trim();
    if (cleanedPrompt) {
      segments.push(`[ACTION]: ${cleanedPrompt}`);
    }

    return segments.join("\n\n");
  }
}
