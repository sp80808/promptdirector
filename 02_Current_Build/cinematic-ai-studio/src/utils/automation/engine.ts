/**
 * Automation Engine — Orchestrates agent execution and suggestion management
 * 
 * This module ties the Agent Registry to the Zustand store, acting as the
 * bridge between state changes and automated workflows.
 */

import { useStore } from '@/store';
import { AgentRegistry } from '@/utils/agents/registry';
import { AgentContext, AgentResult, EventBus } from '@/utils/agents/base';
import type { Take } from '@/types';

/**
 * Initialize event-driven automation triggers.
 * Call once on app startup (e.g., in App.tsx).
 */
export function initializeAutomationTriggers() {
  // When a take finishes rendering → run TakeCuratorAgent for that shot
  EventBus.subscribe('take.rendered', async (event) => {
    const { shotId, takeId } = event.payload;
    console.log(`[AutomationTrigger] take.rendered → running agents for shot ${shotId.slice(0,6)}`);
    await runAutomationForShot(shotId);
  });

  // When shot is updated (e.g., prompt changed) → run PromptEnhancer (if debounced already, this is redundant but OK)
  // Actually we rely on UI debounce, so skip event subscription here to avoid duplicate runs
  
  console.log('[Automation] Event triggers initialized');
}

/**
 * Run all enabled agents for a specific shot.
 * Creates suggestion records in the store for user review.
 */
export async function runAutomationForShot(shotId: string): Promise<number> {
  const state = useStore.getState();
  const shot = state.shots[shotId];
  if (!shot) {
    console.warn(`[Automation] Shot ${shotId} not found`);
    return 0;
  }

  // Build agent context from current store state
  const context: AgentContext = {
    shotId,
    shot,
    characters: state.characters,
    locations: state.locations,
    props: state.props,
    apiKey: state.apiKeys.google,
    config: state.automationConfig,
    store: state,
  };

  // Execute agents
  const results = await AgentRegistry.runAll(context);

  // Process results by type
  let added = 0;
  for (const result of results) {
    if (result.type === 'take_rating') {
      // Apply quality score to take metadata directly (no suggestion UI needed)
      const { takeId, metrics } = result.metadata as { takeId: string; metrics: any };
      if (takeId && metrics) {
        const take = shot.takes.find(t => t.id === takeId);
        if (take) {
          // Merge quality metrics into metadata
          const updatedMetadata = { 
            ...(take.metadata || {}), 
            qualityScore: metrics.overall,
            qualityBreakdown: metrics.breakdown
          };
          state.updateTake(shotId, takeId, { metadata: updatedMetadata });
          
          // Check auto-approval condition
          const autoApprovalConfig = state.automationConfig.autoApproval;
          if (autoApprovalConfig?.enabled && metrics.overall >= autoApprovalConfig.minScore) {
            state.approveTake(shotId, takeId);
            console.log(`[Automation] Auto-approved take ${takeId.slice(0,6)} (score: ${metrics.overall.toFixed(1)})`);
          }
        }
      }
        }
      }
      added++;
    } else {
      // Standard suggestion (prompt_enhancement, shot_suggestion, etc.)
      // Dedupe: remove previous suggestion from same agent+shot+type
      const existingIdx = state.automationSuggestions.findIndex(s =>
        s.shotId === shotId && 
        s.agentId === result.agentId && 
        s.type === result.type &&
        !s.applied && !s.dismissed
      );
      if (existingIdx >= 0) {
        state.dismissSuggestion(state.automationSuggestions[existingIdx].id);
      }

      if (result.confidence >= (state.automationConfig.promptEnhancer.confidenceThreshold ?? 0.6)) {
        state.addSuggestion({
          agentId: result.agentId!,
          shotId: result.shotId,
          type: result.type,
          original: result.original,
          suggested: result.suggested,
          confidence: result.confidence,
          reason: result.reason,
        });
        added++;
      }
    }
  }

  if (added > 0) {
    console.log(`[Automation] Processed ${added} result(s) for shot ${shotId.slice(0,6)}`);
  }

  return added;
}

/**
 * Run automation for all shots in a scene (batch mode)
 */
export async function runAutomationForScene(sceneId: string): Promise<number> {
  const state = useStore.getState();
  const scene = state.scenes.find(s => s.id === sceneId);
  if (!scene) return 0;
  
  let total = 0;
  for (const shotId of scene.shotIds) {
    const count = await runAutomationForShot(shotId);
    total += count;
  }
  return total;
}

/**
 * Get suggestions for a specific shot, sorted by confidence desc
 */
export function getSuggestionsForShot(shotId: string) {
  const state = useStore.getState();
  return state.automationSuggestions
    .filter(s => s.shotId === shotId && !s.applied && !s.dismissed)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Apply top suggestion for a shot (replaces prompt with suggested version)
 */
export function applyTopSuggestion(shotId: string): boolean {
  const state = useStore.getState();
  const top = state.automationSuggestions
    .filter(s => s.shotId === shotId && !s.applied && !s.dismissed)
    .sort((a, b) => b.confidence - a.confidence)[0];
  
  if (!top) return false;
  
  // Update shot with suggested prompt
  state.updateShot(shotId, { rawPrompt: top.suggested });
  state.applySuggestion(top.id);
  return true;
}

/**
 * Apply top suggestion for a shot (replaces prompt with suggested version)
 */
export function applyTopSuggestion(shotId: string): boolean {
  const state = useStore.getState();
  const top = state.automationSuggestions
    .filter(s => s.shotId === shotId && !s.applied && !s.dismissed)
    .sort((a, b) => b.confidence - a.confidence)[0];
  
  if (!top) return false;
  
  // Handle different suggestion types
  if (top.type === 'prompt_enhancement') {
    state.updateShot(shotId, { rawPrompt: top.suggested });
  } else if (top.type === 'shot_suggestion') {
    // For shot suggestions, we need to create a new shot in the next position
    const shot = state.shots[shotId];
    const scene = state.scenes.find(s => s.id === shot.sceneId);
    if (scene) {
      const suggestionData = JSON.parse(top.suggested);
      const newShotIndex = scene.shotIds.indexOf(shotId) + 1;
      
      // Create new shot with suggested parameters
      state.addShot(scene.id, {
        title: suggestionData.title || 'New Shot',
        characterIds: shot.characterIds, // inherit characters
        outfitIds: shot.outfitIds,
        locationId: shot.locationId,
        rawPrompt: suggestionData.promptFragment,
        optics: suggestionData.optics,
        motion: suggestionData.motion,
      });
    }
  }
  
  state.applySuggestion(top.id);
  return true;
}

/**
 * Auto-apply all high-confidence suggestions for a shot (if user enabled)
 */
export function autoApplyHighConfidence(shotId: string, threshold = 0.9): number {
  const state = useStore.getState();
  const targets = state.automationSuggestions.filter(s =>
    s.shotId === shotId &&
    !s.applied && !s.dismissed &&
    s.confidence >= threshold &&
    s.type === 'prompt_enhancement' // only auto-apply prompt enhancements
  );
  
  for (const s of targets) {
    state.updateShot(shotId, { rawPrompt: s.suggested });
    state.applySuggestion(s.id);
  }
  
  return targets.length;
}

/**
 * Get actionable suggestions for timeline display (shot_suggestion type only)
 */
export function getShotSuggestionsForTimeline(shotId: string) {
  const state = useStore.getState();
  return state.automationSuggestions
    .filter(s => s.shotId === shotId && !s.applied && !s.dismissed && s.type === 'shot_suggestion')
    .sort((a, b) => b.confidence - a.confidence);
}
