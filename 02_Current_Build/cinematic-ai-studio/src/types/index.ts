export type Provider = {
  id: string;
  name: string;
  apiKey: string;
  capability: ("Image" | "Video" | "LLM" | "Vision" | "Audio")[];
};

export type ReferenceImage = {
  id: string;
  url: string;
  label?: string;
};

export type Outfit = {
  id: string;
  name: string;
  clothingDesc: string;
  referenceImages: ReferenceImage[];
};

export type Character = {
  id: string;
  name: string;          // Tag handle (e.g. "Sarah")
  displayName: string;
  traits: string;
  seed: number;
  color: string;
  masterReferenceImages: ReferenceImage[];
  outfits: Outfit[];
  baseLoRA?: string;
  voiceId?: string;      // Assigned voice for TTS
};

export type Location = {
  id: string;
  name: string;
  description: string;
  timeOfDay: string;
  lightingMood: string;
  referenceImages: ReferenceImage[];
  color: string;
};

export type Prop = {
  id: string;
  name: string;
  description: string;
  referenceImages: ReferenceImage[];
  color: string;
};

export type Take = {
  id: string;
  shotId: string;
  videoUrl?: string;
  audioUrl?: string;      // Foley/Ambient
  speechUrl?: string;     // TTS dialogue
  lipSyncUrl?: string;    // Result of audio + visuals
  thumbUrl?: string;
  fullImageUrl?: string;
  seed: number;
  status: "queued" | "rendering" | "rendered" | "failed";
  rating: number;
  createdAt: number;
  duration?: number;
  vlmAnalysis?: {
    description: string;
    consistencyScore: number; // 0-100
    qualityRating: number;    // 1-5
    tags: string[];
    feedback: string;
  };
  metadata?: {
    model: string;
    prompt: string;
    negativePrompt?: string;
    cfgScale: number;
    steps: number;
    aspectRatio: string;
    initImageUrl?: string;
  };
};

export type RenderQueueItem = {
  id: string;
  shotId: string;
  takeId: string;
  priority: number;
  status: "pending" | "queued" | "rendering" | "completed" | "failed";
  progress: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
};

export type ContinuityIssue = {
  id: string;
  shotId: string;
  severity: "warning" | "error" | "info";
  type: "character" | "location" | "lighting" | "prop" | "timing" | "wardrobe";
  message: string;
  suggestion?: string;
};

export type TransitionType = "cut" | "fade" | "dissolve" | "wipe" | "match_cut" | "cut_on_action";

export type ShotSettings = {
  model: string;
  aspectRatio: "16:9" | "21:9" | "1:1" | "9:16";
  cfgScale: number;
  steps: number;
  negativePrompt: string;
};

export type Shot = {
  id: string;
  sceneId: string;
  title: string;
  characterIds: string[]; // Reference to Master Character IDs
  outfitIds: Record<string, string>; // characterId -> outfitId
  locationId?: string;
  rawPrompt: string;
  optics: string;
  motion: string;
  settings: ShotSettings;
  approvedTakeId?: string;
  takes: Take[];
  startTime?: number;
  duration?: number;
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;
  usePreviousFrameAsInit?: boolean;
  notes?: string;
  continuityIssues?: ContinuityIssue[];
  locked?: boolean;
  ambientSoundPrompt?: string;
  musicBedPrompt?: string;
  dialogue?: string;         // The text to be spoken
  speakingCharacterId?: string; // Who is speaking
};

export type Scene = {
  id: string;
  title: string;
  shotIds: string[];
};

export type Modal =
  | null
  | { kind: "settings" }
  | { kind: "character"; id?: string }
  | { kind: "location"; id?: string }
  | { kind: "prop"; id?: string }
  | { kind: "media_viewer"; takeId: string; shotId: string }
  | { kind: "script_breakdown" }
  | { kind: "player" }
  | { kind: "export" };

export interface CinematicState {
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;

  characters: Character[];
  locations: Location[];
  props: Prop[];
  scenes: Scene[];
  shots: Record<string, Shot>;
  renderQueue: RenderQueueItem[];

  modal: Modal;
  setModal: (m: Modal) => void;

  selectedShotId: string | null;
  selectShot: (id: string | null) => void;

  // Actions
  addCharacter: (c: Omit<Character, "id">) => string;
  updateCharacter: (id: string, p: Partial<Character>) => void;
  addOutfit: (charId: string, o: Omit<Outfit, "id">) => void;
  
  addLocation: (l: Omit<Location, "id">) => string;
  updateLocation: (id: string, p: Partial<Location>) => void;
  
  addProp: (p: Omit<Prop, "id">) => string;
  updateProp: (id: string, p: Partial<Prop>) => void;
  
  addScene: (title: string) => string;
  addShot: (sceneId: string, s: Partial<Shot>) => string;
  updateShot: (id: string, p: Partial<Shot>) => void;
  moveShot: (shotId: string, sourceSceneId: string, destSceneId: string, sourceIndex: number, destIndex: number) => void;
  
  addTake: (shotId: string, t: Omit<Take, "id" | "shotId">) => string;
  updateTake: (shotId: string, takeId: string, p: Partial<Take>) => void;
  approveTake: (shotId: string, takeId: string) => void;
  addSceneFromScript: (title: string, breakdown: any) => void;
  
  // Render Queue
  addToRenderQueue: (shotId: string, priority?: number) => string;
  updateRenderQueueItem: (id: string, updates: Partial<RenderQueueItem>) => void;
  removeFromRenderQueue: (id: string) => void;
  clearRenderQueue: () => void;
  
  // Batch Operations
  batchAddToRenderQueue: (shotIds: string[], priority?: number) => string[];
  
  // Continuity
  addContinuityIssue: (shotId: string, issue: Omit<ContinuityIssue, "id">) => void;
  clearContinuityIssues: (shotId?: string) => void;
}
