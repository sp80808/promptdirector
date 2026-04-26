/**
 * Continuity Check Engine for Cinematic.AI
 * Runs validation across shot sequences to detect inconsistencies
 */

import { Shot, Scene, Character, Location, ContinuityIssue } from "../types";

export class ContinuityChecker {
  static checkShotSequence(
    shots: Shot[],
    characters: Character[],
    locations: Location[]
  ): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    for (let i = 0; i < shots.length; i++) {
      const currentShot = shots[i];
      const previousShot = i > 0 ? shots[i - 1] : null;

      // Character Outfit Continuity Check
      if (previousShot) {
        currentShot.characterIds.forEach(charId => {
          const wasInPrevious = previousShot.characterIds.includes(charId);
          
          if (wasInPrevious) {
            const currentOutfit = currentShot.outfitIds[charId];
            const previousOutfit = previousShot.outfitIds[charId];
            
            if (currentOutfit && previousOutfit && currentOutfit !== previousOutfit) {
              issues.push({
                id: '',
                shotId: currentShot.id,
                severity: 'warning',
                type: 'character',
                message: `Character outfit changed without cutaway`,
                suggestion: 'Add a cut shot or confirm costume change is intentional'
              });
            }
          }
        });
      }

      // Location Continuity Check
      if (previousShot && currentShot.locationId && previousShot.locationId) {
        const currentLocation = locations.find(l => l.id === currentShot.locationId);
        const previousLocation = locations.find(l => l.id === previousShot.locationId);
        
        if (currentLocation?.id === previousLocation?.id) {
          if (currentLocation.timeOfDay !== previousLocation.timeOfDay) {
            issues.push({
              id: '',
              shotId: currentShot.id,
              severity: 'warning',
              type: 'lighting',
              message: `Time of day changed within same location`,
              suggestion: 'Check if this is intentional continuity break'
            });
          }

          if (currentLocation.lightingMood !== previousLocation.lightingMood) {
            issues.push({
              id: '',
              shotId: currentShot.id,
              severity: 'info',
              type: 'lighting',
              message: `Lighting mood changed`,
              suggestion: 'Ensure lighting change is motivated'
            });
          }
        }
      }
    }

    return issues;
  }

  static checkSingleShot(shot: Shot): ContinuityIssue[] {
    const issues: ContinuityIssue[] = [];

    if (shot.characterIds.length === 0) {
      issues.push({
        id: '',
        shotId: shot.id,
        severity: 'info',
        type: 'character',
        message: 'No characters assigned to shot'
      });
    }

    if (!shot.locationId) {
      issues.push({
        id: '',
        shotId: shot.id,
        severity: 'info',
        type: 'location',
        message: 'No location assigned to shot'
      });
    }

    if (!shot.rawPrompt || shot.rawPrompt.length < 10) {
      issues.push({
        id: '',
        shotId: shot.id,
        severity: 'warning',
        type: 'timing',
        message: 'Shot description is very short'
      });
    }

    return issues;
  }
}