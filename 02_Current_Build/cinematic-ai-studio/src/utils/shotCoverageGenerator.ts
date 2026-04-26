/**
 * Automatic Shot Coverage Generator
 * Creates standard cinematic coverage from a single master shot
 */

import { Shot } from "../types";

interface CoveragePreset {
  id: string;
  name: string;
  optics: string;
  motion: string;
  promptModifier: string;
}

export const standardCoverage: CoveragePreset[] = [
  {
    id: 'wide',
    name: 'Master Wide Shot',
    optics: '24mm anamorphic, wide angle, establishing shot',
    motion: 'Slow pan right',
    promptModifier: 'Full frame establishing shot showing entire scene and all characters'
  },
  {
    id: 'ots',
    name: 'Over The Shoulder',
    optics: '50mm prime, medium shot',
    motion: 'Static, eye level',
    promptModifier: 'Over the shoulder shot focusing on main performer'
  },
  {
    id: 'closeup',
    name: 'Close Up',
    optics: '85mm prime, tight framing',
    motion: 'Subtle slow push in',
    promptModifier: 'Tight close up on face, emotional reaction shot'
  },
  {
    id: 'reaction',
    name: 'Reaction Shot',
    optics: '65mm prime',
    motion: 'Static',
    promptModifier: 'Cutaway to other character reacting to action'
  },
  {
    id: 'insert',
    name: 'Insert / Detail',
    optics: '100mm macro',
    motion: 'Static',
    promptModifier: 'Close up detail shot of important action or prop'
  }
];

export class ShotCoverageGenerator {
  /**
   * Generate standard coverage shots from one master shot
   */
  static generateCoverage(
    masterShot: Shot,
    includePresets: string[] = ['wide', 'ots', 'closeup', 'reaction']
  ): Partial<Shot>[] {
    return includePresets.map(presetId => {
      const preset = standardCoverage.find(p => p.id === presetId);
      if (!preset) return null;

      return {
        sceneId: masterShot.sceneId,
        title: `${masterShot.title} - ${preset.name}`,
        characterIds: [...masterShot.characterIds],
        outfitIds: { ...masterShot.outfitIds },
        locationId: masterShot.locationId,
        rawPrompt: `${masterShot.rawPrompt}. ${preset.promptModifier}`,
        optics: preset.optics,
        motion: preset.motion,
        settings: { ...masterShot.settings },
        usePreviousFrameAsInit: true
      };
    }).filter(Boolean) as Partial<Shot>[];
  }

  static getPresetById(id: string): CoveragePreset | undefined {
    return standardCoverage.find(p => p.id === id);
  }
}