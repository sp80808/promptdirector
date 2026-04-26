# Cinematic.AI Studio v5.0
**The Unified AI Filmmaking Foundation**

This is the primary production build for Cinematic.AI. It is built with React 19, Vite, and Zustand, following a modular NLE-inspired architecture.

## 🛠 Tech Stack
- **React 19** + **Vite** + **TypeScript**
- **Zustand** (State with persistence)
- **Tailwind CSS** (NLE-styled UI)
- **@hello-pangea/dnd** (Sequencer)
- **Google Generative AI** (Director's Brain)

## 📁 Architecture
- `src/components/views`: Primary studio modules (Forge, Moodboard, Scout).
- `src/components/timeline`: The Sequencing engine.
- `src/components/inspector`: Context-aware property editing.
- `src/components/shared`: Reusable high-fidelity icons and textareas.
- `src/services`: Multi-modal AI orchestration.
- `src/store`: The "Director's Brain" state engine.

## 🚀 Getting Started
```bash
npm install
npm run dev
```

## 🎥 Key Workflows
1. **Forge**: Define character identity and outfits.
2. **Scout**: Create location lighting and moods.
3. **Draft**: Paste scripts into the **Auto-Storyboard** engine.
4. **Direct**: Sequence shots in the timeline and refine prompts with **@ Smart Tagging**.
5. **Export**: Handover the sequence to post-production via **.OTIO** export.

---
Refer to the root **[USER_GUIDE.md](../../USER_GUIDE.md)** for detailed usage instructions.
