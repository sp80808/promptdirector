# Cinematic.AI v5.0: The Unified Director's Studio

## Vision
A high-end, NLE-style web application for professional AI filmmaking. It bridges the gap between traditional cinematic intuition and AI generation mechanics, focusing on **Character Consistency**, **Scene Continuity**, and **Directorial Control**.

## 1. Project Architecture

### Core Tech Stack
- **Framework**: React 19 + Vite + TypeScript
- **State**: Zustand (with Persistence)
- **Styling**: Tailwind CSS 4 (Dark Mode, DaVinci-inspired palette)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React
- **AI Integration**: Google Generative AI (Orchestration) + SiliconFlow/Runway/Seedance (Generation)

### Data Model (`store.ts`)
- **Library**:
  - `Character`: `MasterID`, `DisplayName`, `Traits`, `Seed`, `ReferenceImages[]`, `Outfits[]`, `BaseLoRA`
  - `Outfit`: `ID`, `Name`, `ClothingDesc`, `ReferenceImages[]`
  - `Location`: `ID`, `Name`, `Description`, `TimeOfDay`, `LightingMood`, `ReferenceImages[]`
  - `Prop`: `ID`, `Name`, `Description`, `ReferenceImages[]`
- **Sequence**:
  - `Project` -> `Scene[]` -> `Shot[]`
  - `Shot`: `ID`, `Characters[]`, `LocationID`, `Prompt`, `Optics`, `Motion`, `Duration`, `InitImageChain`, `Takes[]`
  - `Take`: `ID`, `VideoURL`, `AudioURL`, `ThumbURL`, `Seed`, `WorkflowJSON`, `Status`

## 2. Key Features

### A. The "Character Bible" & Modular Outfits [DONE]
- **Master Identity**: Lock the face seed and core traits.
- **Outfit Variants**: Create variants that preserve identity while changing wardrobe.
- **Auto-Extraction**: Inferred from script breakdown via Gemini.

### B. Smart "@" Tagging & Prompt Orchestration [DONE]
- **Mention System**: Type `@Sarah` to inject full character context.
- **Auto-Translation**: Converts directorial terms into technical tokens.

### C. NLE-Style Timeline & Batching [DONE]
- **Sequencer**: Drag-and-drop shot reordering.
- **Batch Render**: "Render Scene" button pushes all shots to the background queue.
- **Frame Chaining**: Previous shot's frame acts as `init_image` for the next.

### D. Audio Stage & Foley Engine [DONE]
- **Ambient Beds**: Prompt-based sound generation per shot.
- **Cinema Player**: Synchronized audio/video playback of the entire cut.

### E. AI Inpaint Studio [DONE]
- **Native Masking**: Paint masks over takes to perform surgical AI edits.

## 3. Implementation Status

- [x] **Phase 1: Foundation**: Zustand store and core NLE layout.
- [x] **Phase 2: Forge & Library**: Character/Location/Prop management.
- [x] **Phase 3: Sequencer & Smart Input**: Timeline and "@" mentioning.
- [x] **Phase 4: AI Integration & Audio**: SiliconFlow bridge, Foley engine, Inpainting.
- [x] **Phase 5: Advanced Intelligence**:
  - [x] **VLM Auto-Audit**: Vision-Language Model rating of generated takes.
  - [x] **Lip-Sync Pipeline**: Automated dialogue animation.
  - [ ] **Asset Management**: Local caching and advanced metadata tagging.
- [ ] **Phase 6: Quality of Life**:
  - [ ] **Auto-Approve Heuristics**: Automatically approve generated takes with high VLM scores.
  - [ ] **Undo / Redo History Stack**: Advanced timeline state management.

---

## Technical Standards
- **Strict Typing**: No `any`.
- **eCoT**: Document complex prompt logic.
- **Performance**: Use `memo` and optimized selectors for the Zustand store.
