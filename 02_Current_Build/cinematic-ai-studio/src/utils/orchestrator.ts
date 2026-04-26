import { Character, Location, Shot } from "../types";

/**
 * eCoT: Prompt Orchestration Engine
 * This utility translates high-level directorial intent and database 
 * relationships into technical tokens for AI video models.
 */

export function buildCinematicPrompt(shot: Shot, character: Character | undefined, location: Location | undefined) {
  if (!character || !location) {
    return shot.rawPrompt || "A cinematic masterwork, 8K resolution.";
  }

  const outfit = shot.outfitIds[character.id] 
    ? character.outfits.find(o => o.id === shot.outfitIds[character.id])
    : null;

  const clothingStr = outfit 
    ? `Wearing: ${outfit.clothingDesc}.` 
    : character.traits;

  const prompt = [
    `Cinematic masterpiece, 8K film still.`,
    `Subject: ${character.displayName}. ${character.traits}. ${clothingStr} Facial seed locked: ${character.seed}.`,
    `Scene: ${location.name}. ${location.description}. Time: ${location.timeOfDay}.`,
    `Action/Emotion: ${shot.rawPrompt}.`,
    `Camera: ${shot.optics || "Arri Alexa 35mm anamorphic, smooth dolly zoom, shallow depth of field"}.`,
    `Motion: ${shot.motion || "Static"}.`,
    `Lighting Stack: ${location.lightingMood}.`,
    `Style: Photorealistic, intricate details, cinematic color timing, subtle film grain.`,
    `--ar ${shot.settings.aspectRatio} --v 6`
  ].join("\n");

  return prompt;
}
