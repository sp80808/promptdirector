import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppView = 'vault' | 'scout' | 'matrix' | 'broll' | 'moodboard';

export interface Provider { id: string; name: string; capability: ('Image' | 'Video' | 'LLM' | 'Vision')[]; apiKey: string; customEndpoint?: string; }
export interface Variant { id: string; soulId: string; name: string; clothingDesc: string; turnaroundUrl: string; seed: number; }
export interface SoulID { id: string; name: string; baseLoRA?: string; variants: Variant[]; signatureMovement?: string; }
export interface Environment { id: string; name: string; lightSourcePlacement?: 'window-left' | 'overhead' | 'practical'; referenceUrl: string; }
export interface PropItem { id: string; name: string; details: string; referenceUrl?: string; }
export interface SceneBlock { id: string; title: string; rhythmPreset: 'Standard' | 'Suspense' | 'Contemplative'; shotIds: string[]; }
export interface BRollItem { id: string; videoUrl: string; promptData: PromptSegment[]; rawPrompt: string; createdAt: number; }

export type PromptSegment = 
  | { type: 'text'; value: string }
  | { type: 'variant'; id: string; label: string }
  | { type: 'environment'; id: string; label: string }
  | { type: 'prop'; id: string; label: string };

export interface Shot { id: string; sceneBlockId: string; variantId?: string; environmentId?: string; rawPrompt: string; enhancedPrompt: string; initImageUrl?: string; videoUrl?: string; lockFace?: boolean; continuityErrors?: string[]; structuredPrompt: PromptSegment[]; }
export interface AsyncTask { id: string; shotId: string; providerId: string; status: 'idle' | 'polling' | 'success' | 'error'; resultUrl?: string; }

interface AppState {
  // Settings
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  // API Keys
  googleAiKey: string;
  nanoBananaKey: string;
  seedanceKey: string;
  setKeys: (keys: { googleAiKey?: string; nanoBananaKey?: string; seedanceKey?: string }) => void;
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  providers: Record<string, Provider>;
  soulIds: Record<string, SoulID>;
  environments: Record<string, Environment>;
  props: Record<string, PropItem>;
  sceneBlocks: Record<string, SceneBlock>;
  shots: Record<string, Shot>;
  brollBucket: BRollItem[];
  tasks: Record<string, AsyncTask>;
  
  moveShot: (shotId: string, sourceBlockId: string, destBlockId: string, sourceIndex: number, destIndex: number) => void;
  updateShotPrompt: (shotId: string, prompt: PromptSegment[], rawText: string) => void;
  setEnhancedPrompt: (shotId: string, prompt: string) => void;
  setContinuityErrors: (shotId: string, errors: string[]) => void;
  toggleFaceLock: (shotId: string) => void;
  chainShot: (sourceShotId: string, initImageUrl?: string) => void;
  addToBRoll: (shotId: string) => void;
  addSceneFromScript: (title: string, importedShots: { description: string }[]) => void;
  queueTask: (task: Omit<AsyncTask, 'id'>) => void;
  updateShotVideo: (shotId: string, videoUrl: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      
      googleAiKey: '',
      nanoBananaKey: '',
      seedanceKey: '',
      setKeys: (keys) => set((state) => ({ ...state, ...keys })),
      
      currentView: 'matrix',
      setCurrentView: (view) => set({ currentView: view }),

      providers: {
        'p1': { id: 'p1', name: 'Google Imagen', capability: ['Image'], apiKey: '' },
        'p2': { id: 'p2', name: 'Seedance 2.0', capability: ['Video'], apiKey: '' }
      },
      soulIds: {
        's1': {
          id: 's1', name: 'Sarah', baseLoRA: 'sarah-v1', signatureMovement: 'cautious walk',
          variants: [
            { id: 'v1', soulId: 's1', name: 'Space Suit', clothingDesc: 'white heavy EVA suit', turnaroundUrl: 'none', seed: 101 },
            { id: 'v2', soulId: 's1', name: 'Civilian', clothingDesc: 'grey jumpsuit', turnaroundUrl: 'none', seed: 102 }
          ]
        }
      },
      environments: {
        'e1': { id: 'e1', name: 'Neon Alleyway', lightSourcePlacement: 'overhead', referenceUrl: 'none' }
      },
      props: {
        'pr1': { id: 'pr1', name: 'Nano Banana', details: 'Glowing yellow, Tech prop', referenceUrl: 'none' },
        'pr2': { id: 'pr2', name: 'Plasma Blaster', details: 'Heavy sci-fi weapon', referenceUrl: 'none' }
      },
      sceneBlocks: {
        'block1': { id: 'block1', title: 'Scene 1: The Arrival', rhythmPreset: 'Suspense', shotIds: ['shot1', 'shot2'] },
        'block2': { id: 'block2', title: 'Scene 2: Infiltration', rhythmPreset: 'Standard', shotIds: [] },
      },
      shots: {
        'shot1': { id: 'shot1', sceneBlockId: 'block1', rawPrompt: 'walking slowly', enhancedPrompt: '', structuredPrompt: [{ type: 'text', value: 'walking slowly ' }] },
        'shot2': { id: 'shot2', sceneBlockId: 'block1', rawPrompt: 'looking around', enhancedPrompt: '', structuredPrompt: [{ type: 'text', value: 'looking around ' }] }
      },
      brollBucket: [],
      tasks: {},

      queueTask: (incomingTask) => set((state) => {
        const taskId = `task_${Date.now()}`;
        return {
          tasks: {
            ...state.tasks,
            [taskId]: { ...incomingTask, id: taskId }
          }
        };
      }),

      updateShotVideo: (shotId, videoUrl) => set((state) => {
        return {
          shots: {
            ...state.shots,
            [shotId]: { ...state.shots[shotId], videoUrl }
          }
        };
      }),

      moveShot: (shotId, sourceBlockId, destBlockId, sourceIndex, destIndex) => set((state) => {
        /* eCoT: 
         * 1. Clone source and dest blocks directly to prevent unintended referential mutation.
         * 2. Remove shotId from the source block.
         * 3. Splice shotId into the dest block array at the specific destIndex.
         * 4. Update the shot's internal sceneBlockId reference so data matches visual tree.
        */
        const sourceBlock = { ...state.sceneBlocks[sourceBlockId] };
        sourceBlock.shotIds = [...sourceBlock.shotIds];

        const destBlock = sourceBlockId === destBlockId ? sourceBlock : { ...state.sceneBlocks[destBlockId] };
        if (sourceBlockId !== destBlockId) {
           destBlock.shotIds = [...destBlock.shotIds];
        }
        
        sourceBlock.shotIds.splice(sourceIndex, 1);
        destBlock.shotIds.splice(destIndex, 0, shotId);
        
        return {
          sceneBlocks: {
            ...state.sceneBlocks,
            [sourceBlockId]: sourceBlock,
            [destBlockId]: destBlock,
          },
          shots: {
            ...state.shots,
            [shotId]: { ...state.shots[shotId], sceneBlockId: destBlockId }
          }
        };
      }),

      updateShotPrompt: (shotId, prompt, rawText) => set((state) => {
        /* eCoT: Update global structured prompt state for specific shot card. */
        return {
          shots: {
            ...state.shots,
            [shotId]: { ...state.shots[shotId], structuredPrompt: prompt, rawPrompt: rawText }
          }
        };
      }),

      setEnhancedPrompt: (shotId, prompt) => set((state) => {
        return {
          shots: {
            ...state.shots,
            [shotId]: { ...state.shots[shotId], enhancedPrompt: prompt }
          }
        };
      }),

      setContinuityErrors: (shotId, errors) => set((state) => ({
        shots: {
          ...state.shots,
          [shotId]: { ...state.shots[shotId], continuityErrors: errors }
        }
      })),

      toggleFaceLock: (shotId) => set((state) => ({
        shots: {
          ...state.shots,
          [shotId]: { ...state.shots[shotId], lockFace: !state.shots[shotId].lockFace }
        }
      })),

      chainShot: (sourceShotId, initImageUrl) => set((state) => {
        /* eCoT: 
         * 1. Find the source shot and its scene block.
         * 2. Clone metadata (variant, environment) to a new shot ID.
         * 3. Set the initImageUrl of the new shot to the extracted frame (or mock videoUrl).
         * 4. Insert the new shot into the SceneBlock's shotIds array immediately following the source shot.
         */
        const sourceShot = state.shots[sourceShotId];
        if (!sourceShot) return state;

        const blockId = sourceShot.sceneBlockId;
        const block = state.sceneBlocks[blockId];
        if (!block) return state;

        const newShotId = `shot_${Date.now()}`;
        const newShot: Shot = {
          ...sourceShot,
          id: newShotId,
          rawPrompt: '',
          enhancedPrompt: '',
          structuredPrompt: [],
          initImageUrl: initImageUrl || sourceShot.videoUrl || 'mock_frame_from_video.jpg', // For demo purposes, fake a frame URL if not provided
          videoUrl: undefined,
          lockFace: false,
          continuityErrors: undefined,
        };

        const sourceIndex = block.shotIds.indexOf(sourceShotId);
        const newShotIds = [...block.shotIds];
        newShotIds.splice(sourceIndex + 1, 0, newShotId);

        return {
          shots: {
            ...state.shots,
            [newShotId]: newShot
          },
          sceneBlocks: {
            ...state.sceneBlocks,
            [blockId]: {
              ...block,
              shotIds: newShotIds
            }
          }
        };
      }),

      addToBRoll: (shotId) => set((state) => {
        const shot = state.shots[shotId];
        if (!shot) return state;
        
        const newItem: BRollItem = {
          id: `broll_${Date.now()}`,
          videoUrl: shot.videoUrl || 'mock_generated_video.mp4',
          promptData: [...shot.structuredPrompt],
          rawPrompt: shot.rawPrompt,
          createdAt: Date.now()
        };

        return { brollBucket: [newItem, ...state.brollBucket] };
      }),

      addSceneFromScript: (title, importedShots) => set((state) => {
        const blockId = `block_${Date.now()}`;
        const newShots: Record<string, Shot> = {};
        const shotIds: string[] = [];

        importedShots.forEach((s, idx) => {
          const shotId = `shot_${Date.now()}_${idx}`;
          shotIds.push(shotId);
          newShots[shotId] = {
            id: shotId,
            sceneBlockId: blockId,
            rawPrompt: s.description,
            enhancedPrompt: '',
            structuredPrompt: [{ type: 'text', value: s.description }],
          };
        });

        const newBlock: SceneBlock = {
          id: blockId,
          title: title || 'Imported Scene',
          rhythmPreset: 'Standard',
          shotIds: shotIds,
        };

        return {
          sceneBlocks: {
            ...state.sceneBlocks,
            [blockId]: newBlock
          },
          shots: {
            ...state.shots,
            ...newShots
          }
        };
      })
    }),
    {
      name: 'directors-cut-storage',
      partialize: (state) => ({ 
        googleAiKey: state.googleAiKey,
        nanoBananaKey: state.nanoBananaKey,
        seedanceKey: state.seedanceKey,
      }),
    }
  )
);
