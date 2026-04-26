/**
 * Frame Chaining Engine
 * Automatic visual continuity between consecutive shots
 */

import { Shot, Take } from "../types";

export class FrameChainingEngine {
  /**
   * Get the final frame from the previous shot's approved take
   * Returns null if no valid previous frame exists
   */
  static getPreviousFrameForShot(
    shotId: string,
    shots: Record<string, Shot>,
    sceneShotOrder: string[]
  ): string | null {
    const shotPosition = sceneShotOrder.indexOf(shotId);
    
    if (shotPosition <= 0) return null;
    
    const previousShotId = sceneShotOrder[shotPosition - 1];
    const previousShot = shots[previousShotId];
    
    if (!previousShot || !previousShot.approvedTakeId) return null;
    
    const approvedTake = previousShot.takes.find(t => t.id === previousShot.approvedTakeId);
    
    if (!approvedTake) return null;
    
    return approvedTake.fullImageUrl || approvedTake.thumbUrl || null;
  }

  /**
   * Check if shot should automatically inherit previous frame
   */
  static shouldChainShot(shot: Shot): boolean {
    return shot.usePreviousFrameAsInit !== false;
  }

  /**
   * Inject init image into generation parameters when appropriate
   */
  static prepareGenerationPayload(
    shot: Shot,
    shots: Record<string, Shot>,
    sceneShotOrder: string[]
  ): {
    initImageUrl?: string;
    chainStrength: number;
    isChained: boolean;
  } {
    if (!this.shouldChainShot(shot)) {
      return { isChained: false, chainStrength: 0 };
    }

    const previousFrame = this.getPreviousFrameForShot(shot.id, shots, sceneShotOrder);
    
    if (!previousFrame) {
      return { isChained: false, chainStrength: 0 };
    }

    return {
      initImageUrl: previousFrame,
      chainStrength: 0.65,
      isChained: true
    };
  }

  /**
   * Get all broken chains in a sequence
   */
  static findBrokenChains(
    shotOrder: string[],
    shots: Record<string, Shot>
  ): string[] {
    const broken: string[] = [];

    for (let i = 1; i < shotOrder.length; i++) {
      const currentShot = shots[shotOrder[i]];
      const previousShot = shots[shotOrder[i - 1]];

      if (currentShot && previousShot && previousShot.approvedTakeId && !currentShot.approvedTakeId) {
        if (this.shouldChainShot(currentShot)) {
          broken.push(currentShot.id);
        }
      }
    }

    return broken;
  }
}