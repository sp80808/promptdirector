# System Directive: Cinematic.AI Agent Guidelines

If you are an AI assistant or coding agent operating on this codebase, you MUST adhere strictly to the following architectural and stylistic rules.

## 1. GATEKEEPING PROTOCOLS
1. **NO BOILERPLATE**: Do not write standard generic UI components. Every line of UI must be highly stylized, following a professional NLE-style (Non-Linear Editor) dark mode workflow (e.g., DaVinci Resolve, Premiere).
2. **NO HARDCODED API LOGIC**: All API calls must route through universal translation utilities. Do not write naked `fetch('https://api.openai.com/...')` within UI components.
3. **NO UI SHORTCUTS**: Do not use `alert()`, `prompt()`, or native browser dialogs. Build custom overlay components fitting an NLE interface.
4. **STRICT TYPING**: All Zustand state, React props, and API payloads must be perfectly typed in TypeScript.
5. **DO NOT INVENT UNDOCUMENTED FEATURES**: If a feature or data model isn't listed in the architectural schema (see `store.ts`), do not hallucinate implementations for it.

## 2. eCoT DIRECTIVES (Embedded Chain of Thought)
To clarify your logic before writing implementation code, you must embed **eCoT comments** inside your complex functions or state mutations. 
*   **Format**: `/* eCoT: 1. Step one... 2. Step two... */`
*   **State Mutations**: Explain what is changing and why.
*   **Prompt Translation**: Detail the logical steps of how raw UI state becomes a model-specific JSON payload.
*   **Complex UI Hooks**: Explain the render, drag-and-drop, or selection cycle.

## 3. CORE ARCHITECTURE STRATEGY
*   **State**: `zustand` is the single source of truth (`/src/store.ts`).
*   **Styling**: Tailwind CSS + `lucide-react` icons. Uses highly specific dark styling (`bg-[#121212]`, `border-[#222]`, `text-slate-400`, `text-orange-500` for accents).
*   **Entity Data Models**: Relies on specific models: `Provider`, `SoulID`, `Variant`, `Environment`, `SceneBlock`, `Shot`, and `AsyncTask`. Never break these relationships.

These instructions should be automatically loaded into your context. Execute them without deviation.
