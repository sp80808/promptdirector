import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CinematicState, Shot, Take, Scene } from "../types";

/* eCoT: 
   Unified State Engine for Cinematic.AI v5.0
   1. Library: Characters (Master/Outfits), Locations, Props.
   2. Sequence: Scenes -> Shots -> Takes.
   3. AI Orchestration: API Keys and Task Tracking.
*/

const uid = () => Math.random().toString(36).slice(2, 11);

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

      addCharacter: (c) => {
        const id = uid();
        set((s) => ({ characters: [...s.characters, { ...c, id }] }));
        return id;
      },
      updateCharacter: (id, p) => set((s) => ({
        characters: s.characters.map(c => c.id === id ? { ...c, ...p } : c)
      })),
      addOutfit: (charId, o) => set((s) => ({
        characters: s.characters.map(c => c.id === charId ? { ...c, outfits: [...c.outfits, { ...o, id: uid() }] } : c)
      })),

      addLocation: (l) => {
        const id = uid();
        set((s) => ({ locations: [...s.locations, { ...l, id, color: l.color || "#b6ff5c" }] }));
        return id;
      },
      updateLocation: (id, p) => set((s) => ({
        locations: s.locations.map(l => l.id === id ? { ...l, ...p } : l)
      })),

      addProp: (p) => {
        const id = uid();
        set((s) => ({ props: [...s.props, { ...p, id, color: p.color || "#38e1ff" }] }));
        return id;
      },
      updateProp: (id, p) => set((s) => ({
        props: s.props.map(pr => pr.id === id ? { ...pr, ...p } : pr)
      })),

      addScene: (title) => {
        const id = uid();
        set((s) => ({ scenes: [...s.scenes, { id, title, shotIds: [] }] }));
        return id;
      },
      addShot: (sceneId, s) => {
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
      updateShot: (id, p) => set((s) => ({
        shots: { ...s.shots, [id]: { ...s.shots[id], ...p } }
      })),
      moveShot: (shotId, sourceSceneId, destSceneId, sourceIndex, destIndex) => set((state) => {
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
      }),

      addTake: (shotId, t) => {
        const id = uid();
        const take: Take = { ...t, id, shotId, createdAt: Date.now() };
        set((s) => ({
          shots: {
            ...s.shots,
            [shotId]: { ...s.shots[shotId], takes: [...s.shots[shotId].takes, take] }
          }
        }));
        return id;
      },
      updateTake: (shotId, takeId, p) => set((s) => ({
        shots: {
          ...s.shots,
          [shotId]: {
            ...s.shots[shotId],
            takes: s.shots[shotId].takes.map(t => t.id === takeId ? { ...t, ...p } : t)
          }
        }
      })),
      approveTake: (shotId, takeId) => set((s) => ({
        shots: {
          ...s.shots,
          [shotId]: { ...s.shots[shotId], approvedTakeId: takeId }
        }
      })),

      addSceneFromScript: (title, breakdown) => {
        const sceneId = uid();
        const shotIds: string[] = [];
        const newShots: Record<string, Shot> = { ...get().shots };
        const existingChars = get().characters;
        const newChars = [...existingChars];

        // 1. Process New Characters
        breakdown.characters.forEach(bc => {
          const exists = existingChars.find(c => c.name.toLowerCase() === bc.name.toLowerCase());
          if (!exists) {
            newChars.push({
              id: uid(),
              name: bc.name,
              displayName: bc.name,
              traits: bc.traits,
              seed: Math.floor(Math.random() * 9999999),
              color: "#" + Math.floor(Math.random()*16777215).toString(16),
              masterReferenceImages: [],
              outfits: []
            });
          }
        });

        // 2. Process Shots
        breakdown.shots.forEach(ss => {
          const id = uid();
          shotIds.push(id);
          newShots[id] = {
            id,
            sceneId,
            title: ss.title,
            characterIds: [],
            outfitIds: {},
            rawPrompt: ss.description,
            optics: ss.optics || "",
            motion: "",
            duration: ss.duration || 3.0,
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

      // Render Queue Actions
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

      // Batch Operations
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

      // Continuity System
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
          // Clear all issues across all shots
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
      })
    }),
    {
      name: "cinematic-v5-storage",
    }
  )
);
