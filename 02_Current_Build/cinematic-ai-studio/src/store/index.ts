import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CinematicState, Shot, Take, Scene, AutomationSuggestion, AutomationConfig, ContinuityIssue } from "../types";
import { EventBus } from "../utils/agents/base";

/* eCoT: 
   Unified State Engine for Cinematic.AI v5.0
   - Library (Characters, Locations, Props)
   - Sequence (Scenes, Shots, Takes)
   - Automation & AI Agents
   - History (Undo/Redo)
 */

const uid = () => Math.random().toString(36).slice(2, 11);

const defaultAutomationConfig: AutomationConfig = {
  promptEnhancer: { enabled: true, level: "moderate" },
  autoApproval: { enabled: false, minScore: 8.5 },
  continuityCheck: { enabled: true, severityThreshold: "warning" },
  shotSuggester: { enabled: true },
  takeCurator: { enabled: true },
};

// Data snapshot for history
type ProjectSnapshot = {
  characters: CinematicState['characters'];
  locations: CinematicState['locations'];
  props: CinematicState['props'];
  scenes: CinematicState['scenes'];
  shots: CinematicState['shots'];
};

interface HistoryState {
  past: ProjectSnapshot[];
  future: ProjectSnapshot[];
}

export const useStore = create<CinematicState>()(
  persist(
    (set, get) => ({
      apiKeys: { google: "", siliconFlow: "", runway: "" },
      setApiKey: (provider, key) => set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } })),

      characters: [],
      locations: [],
      props: [],
      scenes: [],
      shots: {},
      renderQueue: [],

      modal: null,
      setModal: (m) => set({ modal: m }),

      selectedShotId: null,
      selectShot: (id) => set({ selectedShotId: id }),

      automationSuggestions: [],
      automationConfig: defaultAutomationConfig,

      // ── History Logic ──────────────────────────────────────────────────
      past: [],
      future: [],

      saveSnapshot: () => {
        const { characters, locations, props, scenes, shots, past } = get();
        const snapshot: ProjectSnapshot = { characters, locations, props, scenes, shots };
        
        // Limit history to 50 steps
        const newPast = [...past, snapshot].slice(-50);
        set({ past: newPast, future: [] });
      },

      undo: () => {
        const { past, future, characters, locations, props, scenes, shots } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        const current: ProjectSnapshot = { characters, locations, props, scenes, shots };

        set({
          ...previous,
          past: newPast,
          future: [current, ...future]
        });
      },

      redo: () => {
        const { past, future, characters, locations, props, scenes, shots } = get();
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);
        const current: ProjectSnapshot = { characters, locations, props, scenes, shots };

        set({
          ...next,
          past: [...past, current],
          future: newFuture
        });
      },

      // ── Actions ───────────────────────────────────────────────────────
      addSuggestion: (s) => set((state) => ({
        automationSuggestions: [
          ...state.automationSuggestions,
          { ...s, id: uid(), applied: false, dismissed: false, createdAt: Date.now() }
        ]
      })),
      applySuggestion: (id) => set((state) => ({
        automationSuggestions: state.automationSuggestions.map(s =>
          s.id === id ? { ...s, applied: true } : s
        )
      })),
      dismissSuggestion: (id) => set((state) => ({
        automationSuggestions: state.automationSuggestions.map(s =>
          s.id === id ? { ...s, dismissed: true } : s
        )
      })),
      clearSuggestionsForShot: (shotId) => set((state) => ({
        automationSuggestions: state.automationSuggestions.filter(s => s.shotId !== shotId)
      })),
      updateAutomationConfig: (config) => set((state) => ({
        automationConfig: { ...state.automationConfig, ...config }
      })),

      addCharacter: (c) => {
        get().saveSnapshot();
        const id = uid();
        set((s) => ({ characters: [...s.characters, { ...c, id }] }));
        return id;
      },
      updateCharacter: (id, p) => {
        get().saveSnapshot();
        set((s) => ({
          characters: s.characters.map(c => c.id === id ? { ...c, ...p } : c)
        }));
      },
      addOutfit: (charId, o) => {
        get().saveSnapshot();
        set((s) => ({
          characters: s.characters.map(c => c.id === charId ? { ...c, outfits: [...c.outfits, { ...o, id: uid() }] } : c)
        }));
      },

      addLocation: (l) => {
        get().saveSnapshot();
        const id = uid();
        set((s) => ({ locations: [...s.locations, { ...l, id, color: l.color || "#b6ff5c" }] }));
        return id;
      },
      updateLocation: (id, p) => {
        get().saveSnapshot();
        set((s) => ({
          locations: s.locations.map(l => l.id === id ? { ...l, ...p } : l)
        }));
      },

      addProp: (p) => {
        get().saveSnapshot();
        const id = uid();
        set((s) => ({ props: [...s.props, { ...p, id, color: p.color || "#38e1ff" }] }));
        return id;
      },
      updateProp: (id, p) => {
        get().saveSnapshot();
        set((s) => ({
          props: s.props.map(pr => pr.id === id ? { ...pr, ...p } : pr)
        }));
      },

      addScene: (title) => {
        get().saveSnapshot();
        const id = uid();
        set((s) => ({ scenes: [...s.scenes, { id, title, shotIds: [] }] }));
        return id;
      },
      addShot: (sceneId, s) => {
        get().saveSnapshot();
        const id = uid();
        const newShot: Shot = {
          id,
          sceneId,
          title: s.title || "New Shot",
          characterIds: s.characterIds || [],
          outfitIds: s.outfitIds || {},
          locationId: s.locationId,
          rawPrompt: s.rawPrompt || "",
          optics: s.optics || "",
          motion: s.motion || "",
          settings: s.settings || {
            model: "black-forest-labs/FLUX.1-schnell",
            aspectRatio: "16:9",
            cfgScale: 4.5,
            steps: 20,
            negativePrompt: "",
          },
          takes: [],
        };
        set((state) => ({
          shots: { ...state.shots, [id]: newShot },
          scenes: state.scenes.map(sc => sc.id === sceneId ? { ...sc, shotIds: [...sc.shotIds, id] } : sc)
        }));
        return id;
      },
      updateShot: (id, p) => {
        get().saveSnapshot();
        let oldShot: Shot | undefined;
        let newShot: Shot | undefined;
        
        set((s) => {
          const shot = s.shots[id];
          oldShot = shot;
          newShot = { ...shot, ...p };
          return {
            shots: { ...s.shots, [id]: newShot }
          };
        });
        
        if (newShot) {
          EventBus.emit('shot.updated', { shotId: id, changes: p, previous: oldShot });
        }
      },
      moveShot: (shotId, sourceSceneId, destSceneId, sourceIndex, destIndex) => {
        get().saveSnapshot();
        set((state) => {
          const sourceScene = state.scenes.find(s => s.id === sourceSceneId);
          const destScene = state.scenes.find(s => s.id === destSceneId);
          if (!sourceScene || !destScene) return state;

          const newSourceShotIds = [...sourceScene.shotIds];
          newSourceShotIds.splice(sourceIndex, 1);

          const newDestShotIds = sourceSceneId === destSceneId ? newSourceShotIds : [...destScene.shotIds];
          newDestShotIds.splice(destIndex, 0, shotId);

          return {
            scenes: state.scenes.map(s => {
              if (s.id === sourceSceneId) return { ...s, shotIds: newSourceShotIds };
              if (s.id === destSceneId) return { ...s, shotIds: newDestShotIds };
              return s;
            }),
            shots: {
              ...state.shots,
              [shotId]: { ...state.shots[shotId], sceneId: destSceneId }
            }
          };
        });
      },

      addTake: (shotId, t) => {
        const id = uid();
        const take: Take = { ...t, id, shotId, createdAt: Date.now() };
        set((s) => ({
          shots: {
            ...s.shots,
            [shotId]: { ...s.shots[shotId], takes: [...s.shots[shotId].takes, take] }
          }
        }));
        EventBus.emit('take.created', { shotId, takeId: id, take });
        return id;
      },
      updateTake: (shotId, takeId, p) => {
        let oldTake: Take | undefined;
        let newTake: Take | undefined;

        set((s) => {
          const shot = s.shots[shotId];
          oldTake = shot?.takes.find(t => t.id === takeId);
          const newTakes = shot.takes.map(t => t.id === takeId ? { ...t, ...p } : t);
          const newShot = { ...shot, takes: newTakes };
          newTake = newShot.takes.find(t => t.id === takeId);
          
          return {
            shots: { ...s.shots, [shotId]: newShot }
          };
        });

        if (oldTake) {
          EventBus.emit('take.updated', { shotId, takeId, changes: p, previous: oldTake });
        }
        if (newTake && (newTake.status === 'rendered' || (p.status === 'rendered'))) {
          EventBus.emit('take.rendered', { shotId, takeId, take: newTake });
        }
      },
      approveTake: (shotId, takeId) => {
        get().saveSnapshot();
        set((s) => ({
          shots: {
            ...s.shots,
            [shotId]: { ...s.shots[shotId], approvedTakeId: takeId }
          }
        }));
      },

      addSceneFromScript: (title, breakdown) => {
        get().saveSnapshot();
        const sceneId = uid();
        const shotIds: string[] = [];
        const newShots: Record<string, Shot> = { ...get().shots };
        const existingChars = get().characters;
        const newChars = [...existingChars];

        const nameToId: Record<string, string> = {};
        existingChars.forEach(c => { nameToId[c.name.toLowerCase()] = c.id; });

        breakdown.characters.forEach((bc: any) => {
          const lowerName = bc.name.toLowerCase();
          if (!nameToId[lowerName]) {
            const id = uid();
            nameToId[lowerName] = id;
            newChars.push({
              id,
              name: bc.name,
              displayName: bc.name,
              traits: bc.traits,
              seed: Math.floor(Math.random() * 9999999),
              color: "#" + Math.floor(Math.random()*16777215).toString(16),
              masterReferenceImages: [],
              outfits: [],
              voiceId: bc.suggestedVoice
            });
          }
        });

        breakdown.shots.forEach((ss: any) => {
          const id = uid();
          shotIds.push(id);
          const speakerId = ss.speakerName ? nameToId[ss.speakerName.toLowerCase()] : undefined;
          
          newShots[id] = {
            id,
            sceneId,
            title: ss.title,
            characterIds: speakerId ? [speakerId] : [],
            outfitIds: {},
            rawPrompt: ss.description,
            optics: ss.optics || "",
            motion: "",
            duration: ss.duration || 3.0,
            dialogue: ss.dialogue,
            speakingCharacterId: speakerId,
            takes: [],
            settings: {
              model: "black-forest-labs/FLUX.1-schnell",
              aspectRatio: "16:9",
              cfgScale: 4.5,
              steps: 20,
              negativePrompt: ""
            }
          };
        });

        set((state) => ({
          characters: newChars,
          scenes: [...state.scenes, { id: sceneId, title, shotIds }],
          shots: newShots
        }));
      },

      addToRenderQueue: (shotId, priority = 5) => {
        const id = uid();
        set((s) => ({
          renderQueue: [...s.renderQueue, {
            id,
            shotId,
            takeId: "",
            priority,
            status: "pending",
            progress: 0,
            createdAt: Date.now()
          }]
        }));
        return id;
      },
      updateRenderQueueItem: (id, updates) => set((s) => ({
        renderQueue: s.renderQueue.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      removeFromRenderQueue: (id) => set((s) => ({
        renderQueue: s.renderQueue.filter(item => item.id !== id)
      })),
      clearRenderQueue: () => set({ renderQueue: [] }),
      batchAddToRenderQueue: (shotIds, priority = 5) => {
        const items = shotIds.map((shotId, index) => ({
          id: uid(),
          shotId,
          takeId: "",
          priority: priority + (index * 0.1),
          status: "pending" as const,
          progress: 0,
          createdAt: Date.now()
        }));
        set((s) => ({ renderQueue: [...s.renderQueue, ...items] }));
        return items.map(i => i.id);
      },

      addContinuityIssue: (shotId, issue) => set((s) => {
        const newIssue = { ...issue, id: uid(), shotId };
        return {
          shots: {
            ...s.shots,
            [shotId]: {
              ...s.shots[shotId],
              continuityIssues: [...(s.shots[shotId].continuityIssues || []), newIssue]
            }
          }
        };
      }),
      clearContinuityIssues: (shotId) => set((s) => {
        if (!shotId) {
          const clearedShots: typeof s.shots = {};
          Object.keys(s.shots).forEach(id => {
            clearedShots[id] = { ...s.shots[id], continuityIssues: [] };
          });
          return { shots: clearedShots };
        }
        return {
          shots: {
            ...s.shots,
            [shotId]: { ...s.shots[shotId], continuityIssues: [] }
          }
        };
      }),

      importSequence: (data) => {
        get().saveSnapshot();
        set((state) => {
          if (!data || !data.scenes || !data.shots) return state;
          return {
            ...state,
            scenes: data.scenes,
            shots: data.shots,
            characters: data.characters || [],
            locations: data.locations || [],
            props: data.props || []
          };
        });
      }
    }),
    {
      name: "cinematic-v5-storage",
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        characters: state.characters,
        locations: state.locations,
        props: state.props,
        scenes: state.scenes,
        shots: state.shots,
        automationConfig: state.automationConfig,
      }),
    }
  )
);
