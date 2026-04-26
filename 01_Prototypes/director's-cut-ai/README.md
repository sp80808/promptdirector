# CINEMATIC.AI Studio v4.0

A professional NLE-style (Non-Linear Editor) web application for AI filmmaking. Cinematic.AI bridges the gap between traditional filmmaking intuition and AI generation mechanics, transforming prompt engineering into a visual, director-centric workflow.

## 🎬 Core Concept
We are moving away from the single-textbox prompting paradigm. Filmmakers think in coverage, lighting setups, 180-degree rules, and character Bibles. Cinematic.AI provides a Kanban-style sequencer, smart asset tagging, and LLM-driven cinematic translation to bridge this gap.

## ✨ High-Level Automation Features

### 1. The "@" Tagging System (Smart Prompts)
Integrates a dynamic command palette right into the prompt bar. Typing `@Sarah` dynamically links her specific `SoulID`, `Variant`, and `LoRA` parameters directly into the shot's payload, eliminating manual copying and pasting.

### 2. The "Coverage" Autocomplete
Drag two characters into a Scene Block, and the AI suggests standard setups: `[Wide] -> [OTS Left] -> [OTS Right] -> [CU Left] -> [CU Right]`. Contextual automation instantly fills out camera angles, maintaining spatial continuity for standard dialogue coverage.

### 3. Cinematic DNA Mashup
Enter reference films (e.g. `Blade Runner + Children of Men`), and the built-in LLM translator outputs rigorous technical prompts defining lighting, focal lengths, film stock, and contrast ratios automatically.

### 4. Spatial Axis Guardian
Silently monitors the 180-degree rule. If Character A is screen-left and Character B is screen-right, reverse angles are automatically adapted in the underlying prompt string.

### 5. Automated Foley & Sound Extractor
Processes video generation prompts and creates a side-car JSON/EDL of suggested sound effects (e.g. `['Rain_Heavy', 'Neon_Buzz', 'Cyberpunk_Footsteps']`) matched to the visual beats.

### 6. One-Click Frame Chaining
Seamlessly pull the last frame of a generated clip and insert it as the `init_image` (Start Frame) of the subsequent shot in the timeline, locking in visual continuity.

### 7. Match-Cut Bridge Generator
An automated LLM analysis between two adjacent Scene Blocks that writes a 0.5-second transitional visual prompt, turning slideshows into seamlessly stylized match cuts.

## 🛠 Tech Stack
* Core Framework: React 18, Vite, TypeScript
* State Management: Zustand
* Styling: Tailwind CSS, Lucide Icons, Shadcn UI patterns
* Drag & Drop: `@hello-pangea/dnd`
* AI SDKs: Google Gen AI SDK for LLM-driven prompt translation/vision

## 🚀 Getting Started

1. `npm install`
2. `npm run dev`
3. Configure your API keys (Google AI Studio, etc.) in the Settings panel (BYOK - Bring Your Own Keys).
