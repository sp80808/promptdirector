# Product Roadmap: Cinematic.AI Studio v4.0

Our roadmap focuses on expanding the Non-Linear Editor experience to rival standard NLEs, while deeply integrating AI logic for prompt optimization, spatial mapping, and cross-model video generation.

## Phase 1: Core Architecture & UI [IN PROGRESS]
- [x] Base layout (Vault, Matrix, B-Roll, Scout, Moodboard)
- [x] Zustand state management with strict typings
- [x] Kanban DnD board (`@hello-pangea/dnd`) for Scene Blocks and Shots
- [x] Smart `@` Tagging System in Prompt Input
- [ ] Mock payload translator architecture

## Phase 2: Execution & AI Integration [UPCOMING]
- [ ] Implement `PayloadTranslator` to dynamically format Prompts based on Provider (Seedance, Kling, Runway, Pika, etc.)
- [ ] Connect Google Imagen/Gemini models for the Vibe Translator and Moodboard Generator.
- [ ] Execute `One-Click Frame Chaining` (feeding `videoUrl` into the next shot's `initImageUrl`).
- [ ] Asynchronous task queueing with polling (simulating video generation wait times).

## Phase 3: Advanced Filmmaking Automation [PLANNED]
- [ ] **The Coverage Autocomplete**: Auto-populate standard multi-shot scene structures with a single click.
- [ ] **Spatial Axis Guardian**: Build the LLM routing logic to detect and adjust opposite angles (180-degree rule).
- [ ] **Doppelgänger Lock**: Automated InsightFace pipeline queued after video generation.
- [ ] **Match-Cut Bridge Generator**: LLM checks Shot A's exit frame and Shot B's entry frame to create morphing prompts.

## Phase 4: Polish & Post-Processing [LONG TERM]
- [ ] **In-App Dehancer**: WebGL or CSS `<feTurbulence>` filters to add authentic 35mm grain and halation over generated MP4s.
- [ ] **Automated Foley Metadata**: Generate standard sound design EDL based on visual prompts.
- [ ] Export directly to Premiere Pro XML / DaVinci Resolve timelines.
