# Cinematic.AI v5.0: The Unified Director's Studio

## Vision
A high-end, NLE-style web application for professional AI filmmaking. It bridges the gap between traditional cinematic intuition and AI generation mechanics, focusing on **Character Consistency**, **Scene Continuity**, and **Directorial Control**.

## 1. Project Architecture

### Core Tech Stack
- **Framework**: React 19 + Vite + TypeScript
- **State**: Zustand (with Persistence)
- **Styling**: Tailwind CSS (Dark Mode, DaVinci-inspired palette)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React
- **AI Integration**: Google Generative AI (Orchestration) + SiliconFlow/Runway/Seedance (Generation)

### Data Model (`store.ts`)
- **Library**:
  - `Character`: `MasterID`, `DisplayName`, `Traits`, `Seed`, `ReferenceImages[]`, `Outfits[]`
  - `Outfit`: `ID`, `Name`, `ClothingDesc`, `ReferenceImages[]`
  - `Location`: `ID`, `Name`, `Description`, `TimeOfDay`, `LightingMood`, `ReferenceImages[]`
  - `Prop`: `ID`, `Name`, `Description`, `ReferenceImages[]`
- **Sequence**:
  - `Project` -> `Scene[]` -> `Shot[]`
  - `Shot`: `ID`, `Characters[]`, `LocationID`, `Prompt`, `Optics`, `Motion`, `Takes[]`, `ApprovedTakeID`
  - `Take`: `ID`, `VideoURL`, `ThumbURL`, `Seed`, `Status` (queued/rendered/failed)

## 2. Key Features

### A. The "Character Bible" & Modular Outfits
- **Master Identity**: Lock the face seed and core traits.
- **Outfit Variants**: Create "Civilian", "Space Suit", "Battle Damaged" variants that preserve the Master's facial identity.
- **Ingredient Reference**: Pass multiple reference images to APIs (like FLUX.2) for zero-morph consistency.

### B. Smart "@" Tagging & Prompt Orchestration
- **Mention System**: Type `@Sarah` to inject her full character sheet into the generation payload.
- **Auto-Translation**: The Orchestrator converts high-level directorial terms (e.g., "35mm anamorphic, slow dolly-in") into precise technical prompts for the target model.

### C. NLE-Style Timeline
- **Non-Linear Editing**: Drag and drop shots to reorder.
- **Multi-Take Workflow**: Render multiple versions of a shot, rate them, and "Approve" the best one.
- **Frame Chaining**: Use the last frame of an approved Take as the `init_image` for the next shot.

### D. BYOK AI Engine
- **Provider System**: Plug in API keys for SiliconFlow (Hunyuan/Wan2.2), Google (Gemini/Veo), Runway, and custom endpoints.

## 3. Implementation Plan

### Phase 1: Foundation & Unified Store [COMPLETED]
- Merge `store.ts` from prototypes.
- Implement the `Character` -> `Outfit` relationship.
- Setup the basic NLE layout (SideNav, Main Canvas, Right Inspector).

### Phase 2: The Character Forge & Library [COMPLETED]
- Build the "Character Forge" for creating Master identities and Outfit variants.
- Implement the "Location Scout" and "Prop Room".
- **Added**: "Concept Engine" (Moodboard).

### Phase 3: The Sequencer & Smart Input [COMPLETED]
- Implement the Timeline with drag-and-drop (`@hello-pangea/dnd`).
- Integrate the `MentionTextarea` for shot-level prompting.
- Build the "Orchestrator" utility for prompt construction.
- **Added**: "Auto-Storyboard" (Script Breakdown).

### Phase 4: AI Integration & Continuity [IN PROGRESS]
- Implement the BYOK Settings panel. [COMPLETED]
- Build the "Generation Task Queue".
- Add "Frame Chaining" logic (Approved Take -> Init Image).
- **Added**: ".OTIO" Professional Export. [COMPLETED]

### Phase 5: Polish & Advanced Features [IN PROGRESS]
- Add "Coverage Autocomplete" (suggesting OTS, CU, Wide shots). [COMPLETED]
- Add "Cinematic DNA" mashup tool.
- Visual polish (NLE-styled UI components). [COMPLETED]
- **Added**: NLE Keyboard Shortcuts (J/K/L). [COMPLETED]

---

## Technical Standards
- **Strict Typing**: No `any`.
- **eCoT**: Document complex prompt logic.
- **Performance**: Use `memo` and optimized selectors for the Zustand store.
