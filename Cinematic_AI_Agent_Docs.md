# Cinematic.AI: Unified Project Structure & Agent Reference

This document serves as the master reference for all AI agents and developers contributing to the **Cinematic.AI** ecosystem. It defines the architectural standards, coding protocols, and stylistic requirements derived from the successful prototypes in this workspace.

---

## 1. Project Architecture & Stack

Cinematic.AI follows a modular, state-driven architecture optimized for professional filmmaking workflows (NLE-style).

### **Core Technology Stack**
- **Framework**: React 18+ with Vite (TypeScript)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Single source of truth)
- **Styling**: Tailwind CSS (Dark Mode by default)
- **Icons**: Lucide React
- **Drag & Drop**: `@hello-pangea/dnd`
- **AI Integration**: Google Generative AI (Gemini) for prompt translation and orchestration.

### **Directory Structure**
```text
/src
  /components     # Atomic and composite UI elements (NLE-styled)
    /timeline     # Sequencer, shots, and drag-and-drop logic
    /inspector    # Properties panel for Characters, Locations, Shots
    /modals       # Settings, Character Creator, Export
  /store          # Zustand store (store.ts) - The "State Engine"
  /utils          # Prompt builders, API wrappers, translation logic
  /types          # Global TypeScript interfaces
  index.css       # Core design system tokens (colors, gradients)
  App.tsx         # Main layout orchestrator
```

---

## 2. Agent Reference & Guidelines

AI agents operating on this codebase **MUST** adhere to these strict protocols to ensure consistency and system integrity.

### **A. Gatekeeping Protocols**
1.  **Strict Styling**: Avoid generic "Material" or "Bootstrap" looks. Every component must feel like a professional video editor (DaVinci Resolve, Premiere). Use hex codes: `bg-[#121212]`, `border-[#222]`, `text-slate-400`.
2.  **Universal Translation**: Never call external APIs (OpenAI, Google, etc.) directly from UI components. Use the `orchestrator` or `utils` layer to translate internal state into API payloads.
3.  **No Native UI**: Do not use `alert()` or `confirm()`. Use the custom `Modal` system defined in `store.ts`.
4.  **TypeScript First**: Every function, prop, and state mutation must be explicitly typed. Avoid `any`.

### **B. Embedded Chain of Thought (eCoT)**
Complex logic—especially prompt construction or timeline mutations—must be documented with eCoT comments:
```typescript
/* eCoT: 
   1. Extract Character traits and clothing from the store.
   2. Combine with Shot-specific emotion and optics.
   3. Append Location lighting data.
   4. Format into a technical 'Shot Description' for the generator.
*/
function buildShotPrompt(...) { ... }
```

---

## 3. Data Model & State Management

### **Zustand State (`store.ts`)**
The store is the "Director's Brain". It maintains:
- **Characters**: SoulIDs, Variants, Traits, and Seeds.
- **Locations**: Descriptions, Time of Day, and Color Themes.
- **Shots**: Start times, Durations, Optics, and Notes.
- **Takes**: Rendered results, Ratings, and Frame-chaining data.

### **Entity Relationships**
- **Characters** can have `parentId`s (Variants).
- **Shots** reference `characterIds` and `locationId`.
- **Takes** belong to a `Shot` and can be "Approved" to become the master version.

---

## 4. UI/UX Design System

### **Color Palette**
- **Backgrounds**: `#0a0a0a` (Deep), `#121212` (Surface), `#1e1e1e` (Elevated)
- **Accents**: `#ff6b3d` (Orange), `#38e1ff` (Cyan), `#b6ff5c` (Lime)
- **Borders**: `#222`, `#333`

### **Component Guidelines**
- **Knobs & Sliders**: Must feel tactile. Use custom SVG or CSS-heavy components.
- **Timeline**: Horizontal scrolling with a persistent playhead. Shots are draggable and resizable.
- **Inspector**: Context-aware properties panel on the right sidebar.

---

## 5. Feature Workflow: Adding New Capability

When adding a feature (e.g., "Automated Foley Generator"):
1.  **Update Types**: Add necessary interfaces to `store.ts` or a new `types/foley.ts`.
2.  **Extend Store**: Add actions to `useStore` (e.g., `generateFoleyForShot`).
3.  **Build Logic**: Implement the utility in `/src/utils/foleyOrchestrator.ts`.
4.  **Create UI**: Build a new component in `/src/components/inspector/FoleyPanel.tsx`.
5.  **Test Integration**: Ensure it respects the "Director-centric" workflow.

---

## 6. Project Roadmap (Priority)
- [ ] **Phase 1**: Polish the "@" Tagging System for smart prompts.
- [ ] **Phase 2**: Implement "Coverage Autocomplete" for shot sequencing.
- [ ] **Phase 3**: Frame-chaining persistence (using approved Takes as Init Images).
- [ ] **Phase 4**: Multi-provider support (Banana, Seedance, RunPod).

---

*Contact the Lead Director (USER) for architectural deviations.*
