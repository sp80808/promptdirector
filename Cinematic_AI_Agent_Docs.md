# Cinematic.AI: Master Documentation & Strategy
**Status**: ACTIVE | **Version**: 5.0 | **Last Updated**: 2026-04-26

This is the central knowledge hub for **Cinematic.AI**, a professional NLE-style studio for AI filmmaking. This workspace contains a collection of high-fidelity prototypes and the active v5.0 production build.

---

## 📖 Core Documentation Suite
To maintain project integrity, follow these specialized manuals:

- **[AGENT_REFERENCE.md](./AGENT_REFERENCE.md)**: Technical manual for AI collaboration. Architecture, data models, and implementation protocols.
- **[USER_GUIDE.md](./USER_GUIDE.md)**: Director's manual. Workflow guides for script breakdown, concept generation, and post-production.
- **[Cinematic_AI_v5_Plan.md](./Cinematic_AI_v5_Plan.md)**: The active development roadmap and feature status.

---

## 🏗️ Workspace Organization
The workspace is bifurcated into experimental and production domains:

- **`/01_Prototypes/`**: Legacy architectural explorations and UI blueprints.
- **`/02_Current_Build/cinematic-ai-studio/`**: The active v5.0 React Studio.

### **Production Directory Structure**
```text
/src
  /components
    /layout       # App shell, navigation, and top-level framing.
    /views        # Full-screen modules (Forge, Moodboard, Scout).
    /timeline     # Sequencing engine and drag-and-drop logic.
    /inspector    # Contextual property editing and Smart Coverage.
    /shared       # Atomic components (Polished Icons, Mentions).
    /modals       # Script Breakdown, Settings, Export overlays.
  /services       # Multi-modal AI orchestration logic (Gemini).
  /store          # Zustand state management (The "Director's Brain").
  /types          # Strict TypeScript interfaces.
  /utils          # Prompt builders and export utilities (.OTIO).
  /styles         # Design system tokens and Vanilla CSS.
```

---

## 🎨 The "WOW Factor" Design Standard
Cinematic.AI is not a tool; it is a **Studio**. Every UI addition must feel premium:
- **NLE Aesthetics**: High-contrast dark mode, subtle borders, and glowing accents.
- **Tactility**: Every button and slider should have hover/active states and micro-animations.
- **Professionalism**: No generic icons. Use the custom library in `src/components/shared/Icons.tsx`.

---

## 🚀 Priority Roadmap (Next Steps)
- **Phase 4**: Complete the **Generation Task Queue** for multi-shot rendering.
- **Phase 4**: Implement **Frame Chaining** (Approved Take ➔ Next Shot Init Image).
- **Phase 5**: Advanced **Cinematic DNA** mashup tool for cross-scene style consistency.

---
*Directed by: [USER]*  
*Engineered by: Antigravity*
