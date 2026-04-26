# Cinematic.AI Agent Reference & Technical Manual
**Status**: ACTIVE | **Version**: 5.0 | **Codename**: "Unified Director"

This document serves as the primary technical reference for AI agents working on the Cinematic.AI codebase. It defines the architecture, data models, design philosophy, and implementation protocols required to maintain the project's premium standard.

---

## 1. Codebase Topology
The project is organized into two distinct high-level domains to separate experimental logic from the production build.

- **`/01_Prototypes/`**: Legacy and experimental builds used for UI/UX exploration.
  - `ai-film-director-studio (1)`: Original functional core.
  - `director's-cut-ai`: Blueprint for high-end NLE aesthetics.
- **`/02_Current_Build/cinematic-ai-studio/`**: The active v5.0 production codebase. **All new features must be implemented here.**

---

## 2. Technical Stack
- **Framework**: React 19 (Vite)
- **State Management**: Zustand with `persist` middleware (The "Director's Brain").
- **Styling**: Vanilla CSS + Tailwind CSS (Strict NLE/Dark-mode theme).
- **Icons**: Custom `Icons.tsx` (Premium/Stylized) + Lucide React (Utility).
- **Drag & Drop**: `@hello-pangea/dnd`.

---

## 3. Data Architecture (v5.0)
The state is managed in `src/store/index.ts` and typed in `src/types/index.ts`.

### 3.1 Library Layer (Assets)
- **Character**: The "Master Identity". Contains traits, face seeds, and a list of `Outfits`.
- **Outfit**: Specialized variants (e.g., "Space Suit") that inherit from the Master Character but change clothing descriptions and reference images.
- **Location**: Defines environment, `timeOfDay`, and `lightingMood`.

### 3.2 Sequence Layer (Composition)
- **Scene**: A container for a logical grouping of shots.
- **Shot**: The primary unit of composition. Binds to one `Location` and multiple `Characters` (with specific `Outfit` overrides).
- **Take**: An individual AI generation result for a shot. Can be "Approved" to lock the visual continuity.

---

## 4. Component Organization Standards
All components must follow the reorganized modular structure in `src/components/`:

| Folder | Purpose | Examples |
| :--- | :--- | :--- |
| `layout/` | Structural UI elements (Shell, Nav, Headers). | `App.tsx` navigation. |
| `views/` | Full-screen module interfaces. | `CharacterForge`, `LocationScout`. |
| `timeline/` | Sequencing and shot-reordering logic. | `Timeline.tsx`. |
| `inspector/` | Contextual property panels (Right Rail). | `Inspector.tsx`. |
| `shared/` | Atomic, reusable UI components. | `Icons.tsx`, `MentionTextarea.tsx`. |
| `modals/` | Overlays and settings. | `SettingsModal.tsx`. |

---

## 5. Implementation Protocols (The "Agent Oath")

### 5.1 Design Philosophy: "The WOW Factor"
Cinematic.AI is a premium tool. Every UI addition MUST feel high-end.
- **Colors**: Avoid generic hex codes. Use the defined NLE palette (`bg-ink-950`, `text-accent`).
- **Tactility**: Use subtle borders (`border-line`), hover states, and micro-animations.
- **Aesthetics**: Implement glassmorphism, glowing accents for mentions, and high-contrast typography.

### 5.2 The "Mention" System
All text inputs for prompts should use `MentionTextarea`. 
- **Resolution**: Mentions must resolve to character `seeds`, location `lightingMoods`, and cinematic `action` keywords during prompt orchestration.

### 5.3 Prompt Orchestration (eCoT)
When building AI generation payloads, use the "Orchestrator" pattern:
1. **Gather**: Pull character identities, outfit details, and location lighting.
2. **Translate**: Convert directorial intent (e.g., "Handheld") into technical tokens.
3. **Inject**: Embed metadata like `init_image` IDs for frame-chaining.

---

## 6. Development Roadmap (Current Priorities)
1. **Phase 3 (Active)**: Completing the "Location Scout" and "Prop Room" view implementations.
2. **Phase 4**: Integrating multi-provider AI orchestration (SiliconFlow/Veo).
3. **Phase 4**: Implementing "Frame Chaining" (Take N final frame -> Shot N+1 init image).

---

## 7. Code Standards
- **Naming**: Use `PascalCase` for components, `camelCase` for variables/actions.
- **Persistence**: Ensure critical user library data is persisted via Zustand.
- **Typing**: Strict TypeScript. No `any` types. Define interfaces in `src/types/index.ts`.

---
*Note: This document is dynamic. Agents should update it when architectural shifts occur.*
