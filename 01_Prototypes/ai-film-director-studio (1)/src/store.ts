import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Character = {
  id: string;
  name: string;
  age: number;
  traits: string;
  seed: number;
  clothing: string;
  isBase: boolean;
  baseId?: string;
  referenceImage?: string;
  loraModel?: string; // e.g. "lora_kira_v3"
  trainingImages?: number;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  timeOfDay: string;
  lighting: string;
};

export type Take = {
  id: string;
  number: number;
  prompt: string;
  rating: number;
  previewUrl?: string;
  createdAt: Date;
};

export type Shot = {
  id: string;
  order: number;
  characterId: string;
  locationId: string;
  duration: number; // in seconds
  startTime: number;
  emotionArc: string;
  optics: string;
  lighting: string;
  fullPrompt: string;
  takes: Take[];
  selectedTakeId?: string;
  initImage?: string; // URL for frame chaining / start frame
};

export type ApiKeys = {
  google: string;
  nanoBanana: string;
  seedance: string;
};

type State = {
  apiKeys: ApiKeys;
  characters: Character[];
  locations: Location[];
  shots: Shot[];
  selectedShotId: string | null;
  selectedTakes: string[]; // for comparison
  audioTrack: { url?: string; name?: string; waveform?: number[] };
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  addCharacter: (char: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  createVariant: (baseId: string, newClothing: string) => void;
  deleteCharacter: (id: string) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;
  shotsActions: {
    addShot: (characterId: string, locationId: string) => void;
    updateShot: (id: string, updates: Partial<Shot>) => void;
    deleteShot: (id: string) => void;
    reorderShots: (newOrder: Shot[]) => void;
    addTake: (shotId: string) => void;
    rateTake: (shotId: string, takeId: string, rating: number) => void;
  };
  selectShot: (id: string | null) => void;
  setSelectedTakes: (ids: string[]) => void;
  uploadAudio: (file: File) => void;
  generatePromptForShot: (shot: Shot) => string;
};

const defaultLocations: Location[] = [
  { id: 'loc1', name: 'NEON UNDERCITY', description: 'Rain-slicked streets glowing with holographic ads', timeOfDay: 'Night', lighting: '5600K cyan key, magenta rim' },
  { id: 'loc2', name: 'ORBITAL HABITAT', description: 'Zero-G observation deck with Earth below', timeOfDay: 'Eternal', lighting: 'Warm 3200K interior, cold blue fill' },
  { id: 'loc3', name: 'ABANDONED FACTORY', description: 'Rusted machinery and shafts of god rays', timeOfDay: 'Dusk', lighting: 'Harsh 6500K overheads, volumetric fog' },
  { id: 'loc4', name: 'LUXURY PENTHOUSE', description: 'Minimalist glass walls overlooking megacity', timeOfDay: 'Golden Hour', lighting: 'Soft 4000K diffused, practical neon' },
];

const sampleCharacters: Character[] = [
  {
    id: 'char1',
    name: 'KIRA',
    age: 27,
    traits: 'Cynical hacker, augmented reflexes, sarcastic wit',
    seed: 424242,
    clothing: 'Leather trench, glowing neural implants',
    isBase: true,
    loraModel: 'lora_kira_v3.safetensors',
    trainingImages: 24,
  },
  {
    id: 'char1v1',
    name: 'KIRA',
    age: 27,
    traits: 'Cynical hacker, augmented reflexes, sarcastic wit',
    seed: 424242,
    clothing: 'Tactical bodysuit, holographic cape',
    isBase: false,
    baseId: 'char1',
    loraModel: 'lora_kira_space_v1.safetensors',
    trainingImages: 12,
  },
  {
    id: 'char2',
    name: 'DR_VEX',
    age: 54,
    traits: 'Brilliant but unstable neuroscientist, trembling hands',
    seed: 13371337,
    clothing: 'Worn lab coat over cybernetic exoskeleton',
    isBase: true,
    loraModel: 'lora_vex_neuro.safetensors',
    trainingImages: 18,
  },
];

export const useDirectorStore = create<State>()(
  persist(
    (set, get) => ({
      apiKeys: { google: '', nanoBanana: '', seedance: '' },
      characters: sampleCharacters,
      locations: defaultLocations,
      shots: [],
      selectedShotId: null,
      selectedTakes: [],
      audioTrack: { waveform: Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2) },
      
      setApiKeys: (keys) => set((state) => ({ 
        apiKeys: { ...state.apiKeys, ...keys } 
      })),
      
      addCharacter: (char) => set((state) => ({
        characters: [...state.characters, { ...char, id: 'char_' + Date.now() }]
      })),
      
      updateCharacter: (id, updates) => set((state) => ({
        characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      
      createVariant: (baseId, newClothing) => {
        const base = get().characters.find(c => c.id === baseId);
        if (!base) return;
        
        const variant: Character = {
          ...base,
          id: 'var_' + Date.now(),
          clothing: newClothing,
          isBase: false,
          baseId: base.isBase ? base.id : base.baseId,
        };
        set((state) => ({ characters: [...state.characters, variant] }));
      },
      
      deleteCharacter: (id) => set((state) => ({
        characters: state.characters.filter(c => c.id !== id && c.baseId !== id)
      })),
      
      addLocation: (loc) => set((state) => ({
        locations: [...state.locations, { ...loc, id: 'loc_' + Date.now() }]
      })),
      
      shotsActions: {
        addShot: (characterId, locationId) => {
          const state = get();
          const character = state.characters.find(c => c.id === characterId);
          const location = state.locations.find(l => l.id === locationId);
          
          if (!character || !location) return;
          
          let newShot: Shot = {
            id: 'shot_' + Date.now(),
            order: state.shots.length,
            characterId,
            locationId,
            duration: 8,
            startTime: state.shots.reduce((sum, s) => sum + s.duration, 0),
            emotionArc: 'subtle intrigue building to quiet determination',
            optics: '35mm anamorphic, slow push-in at 0.3m/s, slight Dutch tilt',
            lighting: location.lighting,
            fullPrompt: '',
            takes: [],
          };
          
          newShot.fullPrompt = get().generatePromptForShot(newShot);
          
          set((s) => ({
            shots: [...s.shots, newShot],
            selectedShotId: newShot.id
          }));
        },
        
        updateShot: (id, updates) => set((state) => ({
          shots: state.shots.map(s => s.id === id ? { ...s, ...updates } : s)
        })),
        
        deleteShot: (id) => set((state) => ({
          shots: state.shots.filter(s => s.id !== id).map((s, idx) => ({...s, order: idx, startTime: state.shots.slice(0, idx).reduce((sum, shot) => sum + shot.duration, 0)}))
        })),
        
        reorderShots: (newShots) => {
          const updated = newShots.map((shot, index) => ({
            ...shot,
            order: index,
            startTime: newShots.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
          }));
          set({ shots: updated });
        },
        
        addTake: (shotId: string) => {
          const shot = get().shots.find(s => s.id === shotId);
          if (!shot) return;
          
          const newTake: Take = {
            id: 'take_' + Date.now(),
            number: shot.takes.length + 1,
            prompt: shot.fullPrompt,
            rating: Math.floor(Math.random() * 3) + 3,
            previewUrl: `https://picsum.photos/id/${Math.floor(Math.random()*100)+10}/640/360`,
            createdAt: new Date(),
          };
          
          set((state) => ({
            shots: state.shots.map(s => {
              if (s.id === shotId) {
                return {
                  ...s,
                  takes: [...s.takes, newTake],
                  selectedTakeId: newTake.id
                };
              }
              return s;
            })
          }));
        },
        
        rateTake: (shotId, takeId, rating) => {
          set((state) => ({
            shots: state.shots.map(s => {
              if (s.id === shotId) {
                return {
                  ...s,
                  takes: s.takes.map(t => t.id === takeId ? { ...t, rating } : t)
                };
              }
              return s;
            })
          }));
        },
      },
      
      selectShot: (id) => set({ selectedShotId: id, selectedTakes: [] }),
      
      setSelectedTakes: (ids) => set({ selectedTakes: ids }),
      
      uploadAudio: (file) => {
        const url = URL.createObjectURL(file);
        set((state) => ({
          audioTrack: {
            ...state.audioTrack,
            url,
            name: file.name,
            waveform: Array.from({ length: 64 }, () => Math.random() * 0.9 + 0.1)
          }
        }));
      },
      
      generatePromptForShot: (shot: Shot) => {
        const state = get();
        const char = state.characters.find(c => c.id === shot.characterId);
        const loc = state.locations.find(l => l.id === shot.locationId);
        
        if (!char || !loc) return "Missing character or location for prompt orchestration.";
        
        const loraStr = char.loraModel ? ` <lora:${char.loraModel}:0.85>` : '';
        return `Cinematic masterpiece, 8K film still. \n` +
               `Subject: ${char.name} (${char.age}), ${char.traits}. Wearing: ${char.clothing}. Facial seed locked: ${char.seed}. Soul ID trained on ${char.trainingImages} refs.${loraStr}\n` +
               `Scene: ${loc.name}. ${loc.description}. Time: ${loc.timeOfDay}.\n` +
               `Emotion Arc: ${shot.emotionArc || 'subtle smirk transitioning into focused resolve'}.\n` +
               `Camera: ${shot.optics || 'Arri Alexa 35mm anamorphic, smooth dolly zoom, shallow depth of field'}.\n` +
               `Lighting Stack: ${shot.lighting || loc.lighting}.\n` +
               `Init Image Strength: 0.65 (for chaining). \n` +
               `Style: Photorealistic, intricate details, cinematic color timing by Roger Deakins, subtle film grain, directed by Christopher Nolan. --ar 16:9 --stylize 250 --v 6`;
      },
    }),
    {
      name: 'director-studio-storage',
      partialize: (state) => ({ 
        apiKeys: state.apiKeys, 
        characters: state.characters, 
        locations: state.locations,
        shots: state.shots,
        audioTrack: state.audioTrack 
      }),
    }
  )
);
