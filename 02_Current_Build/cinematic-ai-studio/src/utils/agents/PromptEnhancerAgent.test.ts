/**
 * Unit tests for PromptEnhancerAgent
 * Run with: npx vitest src/utils/agents/PromptEnhancerAgent.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptEnhancerAgent } from './PromptEnhancerAgent';
import type { Shot, Character, Location } from '@/types';

// Mock GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: () => JSON.stringify({
          enhanced: 'Close-up portrait of Sarah, eyes glistening with unshed tears, shallow depth of field, 35mm anamorphic lens.',
          confidence: 0.92,
          changes: ['Expanded emotion', 'Added lens']
        })
      })
    }
  }))
}));

describe('PromptEnhancerAgent', () => {
  let agent: PromptEnhancerAgent;
  let mockShot: Shot;
  let mockChar: Character;
  let mockLoc: Location;

  beforeEach(() => {
    agent = new PromptEnhancerAgent();
    
    mockChar = {
      id: 'char1',
      name: 'Sarah',
      displayName: 'Sarah Connor',
      traits: 'Mid-30s, weary eyes, muscular',
      seed: 123456,
      color: '#ff6b3d',
      masterReferenceImages: [],
      outfits: []
    };

    mockLoc = {
      id: 'loc1',
      name: 'Abandoned Warehouse',
      description: 'Rusty metal, broken windows',
      timeOfDay: 'Night',
      lightingMood: 'High contrast, chiaroscuro',
      referenceImages: [],
      color: '#38e1ff'
    };

    mockShot = {
      id: 'shot1',
      sceneId: 'scene1',
      title: 'Test Shot',
      characterIds: ['char1'],
      outfitIds: {},
      locationId: 'loc1',
      rawPrompt: 'Sarah sad',
      optics: '',
      motion: '',
      settings: { model: 'test', aspectRatio: '16:9', cfgScale: 4.5, steps: 20, negativePrompt: '' },
      takes: []
    };
  });

  it('should not apply to empty prompts', async () => {
    const context = buildContext({ ...mockShot, rawPrompt: '' });
    const applicable = agent.isApplicable(context);
    expect(applicable).toBe(false);
  });

  it('should not apply to very long prompts (already detailed)', async () => {
    const longPrompt = 'Close-up portrait of Sarah showing deep sorrow, eyes glistening with unshed tears, lower lip trembling subtly, soft key lighting from above creating gentle shadows, shallow depth of field, 35mm anamorphic lens, slight film grain, moody teal and deep amber palette.'.repeat(2);
    const context = buildContext({ ...mockShot, rawPrompt: longPrompt });
    const applicable = agent.isApplicable(context);
    expect(applicable).toBe(false);
  });

  it('should apply to short prompts with character+location', async () => {
    const context = buildContext(mockShot);
    const applicable = agent.isApplicable(context);
    expect(applicable).toBe(true);
  });

  it('should enhance prompt and return suggestion', async () => {
    const context = buildContext(mockShot);
    const results = await agent.process(context);
    
    expect(results.length).toBe(1);
    const suggestion = results[0];
    expect(suggestion.type).toBe('prompt_enhancement');
    expect(suggestion.confidence).toBeGreaterThan(0.8);
    expect(suggestion.suggested).toContain('Sarah');
    expect(suggestion.suggestified).toContain('35mm'); // lens added
  });

  it('should skip if Google API key not provided', async () => {
    const context = buildContext(mockShot, { google: '' });
    const results = await agent.process(context);
    expect(results.length).toBe(0);
  });
});

// Helper
function buildContext(shot: Shot, apiKey = 'test-key') {
  return {
    shotId: shot.id,
    shot,
    characters: [mockChar],
    locations: [mockLoc],
    props: [],
    apiKey,
    config: { promptEnhancer: { enabled: true, level: 'moderate' } as any },
    store: null as any
  };
}
