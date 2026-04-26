# Cinematic.AI: Expanded Technical Documentation & Innovation Roadmap

## 1. Project Overview
Cinematic.AI is a professional AI filmmaking studio that combines NLE-style workflow with advanced AI generation capabilities. This document expands on the core architecture, data model, and implementation protocols while introducing a structured innovation roadmap.

## 2. Updated Technology Stack (v5.1)
- **Framework**: React 19 + Vite + TypeScript
- **State Management**: Zustand with Persistence Middleware (Director's Brain)
- **Styling**: Tailwind CSS 4.x (Dark Mode with DaVinci Resolve-inspired palette)
- **AI Integration**: Multi-provider orchestration (Google Gemini, SiliconFlow, Runway, Custom Endpoints)
- **Drag & Drop**: `@hello-pangea/dnd` with custom collision detection
- **Icons**: Lucide React + Custom Icon Component Library
- **Build Tooling**: Vite 5.x with ESBuild optimization

## 3. Enhanced Directory Structure
```
/src
  /components
    /layout/           # Shell components (Header, Sidebar, Footer)
    /views/            # Full-screen modules (CharacterForge, LocationScout, Moodboard)
    /timeline/         # Sequencer with drag-and-drop shot management
    /inspector/        # Context-aware properties panels
    /modals/           # Overlay interfaces (Settings, Export, Script Breakdown)
    /shared/           # Atomic UI components (MentionTextarea, Icons, Knobs)
  /store               # Zustand store with persistence layers
  /utils              # Prompt orchestration, API wrappers, translation logic
  /types              # Comprehensive TypeScript interfaces
  /services           # AI provider integrations and authentication
  index.css            # Design system tokens and global styles
  App.tsx              # Root component orchestrator
```

## 4. Comprehensive Data Model
### 4.1 Library Layer (Assets)
- **Character**: `id`, `name`, `displayName`, `traits`, `seed`, `masterReferenceImages`, `outfits: Outfit[]`
- **Outfit**: `id`, `name`, `clothingDesc`, `referenceImages: ReferenceImage[]`
- **Location**: `id`, `name`, `description`, `timeOfDay`, `lightingMood`, `referenceImages`, `color`
- **Prop**: `id`, `name`, `description`, `referenceImages`, `color`

### 4.2 Sequence Layer (Composition)
- **Scene**: `id`, `title`, `shotIds: string[]`
- **Shot**: 
  - `id`, `sceneId`, `title`, `characterIds: string[]`, `outfitIds: Record<string, string>`
  - `locationId?: string`, `rawPrompt: string`, `optics: string`, `motion: string`
  - `settings: ShotSettings`, `takes: Take[]`, `approvedTakeId?: string`
  - `continuityIssues?: ContinuityIssue[]`, `locked?: boolean`
- **Take**: `id`, `shotId`, `videoUrl?`, `thumbUrl?`, `seed`, `status`, `rating`, `metadata`

### 4.3 Rendering & Continuity
- **ShotSettings**: `model`, `aspectRatio`, `cfgScale`, `steps`, `negativePrompt`
- **ContinuityIssue**: `id`, `shotId`, `severity`, `type`, `message`, `suggestion?`
- **RenderQueueItem**: `id`, `shotId`, `takeId`, `priority`, `status`, `progress`, `createdAt`

## 5. Agent Reference & Technical Protocols
### 5.1 Design Philosophy: "The WOW Factor"
- **Strict Styling**: Use NLE-inspired aesthetics with hex codes from design system
- **Tactile Components**: Custom SVG implementations with hover animations
- **Aesthetic Consistency**: Glassmorphism, glowing accents, high-contrast typography

### 5.2 The Mention System
- **MentionTextarea**: Resolves `@CharacterID` to character sheet data during prompt orchestration
- **Universal Translation**: All external API calls must route through `orchestrator.ts`

### 5.3 Embedded Chain of Thought (eCoT)
- Complex logic must include documented thought processes:
```typescript
/* eCoT: 
   1. Extract relevant character traits and outfit information
   2. Combine with shot-specific motion and optics data
   3. Append location lighting and time-of-day context
   4. Format into technical prompt for AI generation
*/
```

## 6. Implementation Protocols
### 6.1 Prompt Orchestration Engine
Located in `src/utils/orchestrator.ts`, this module translates high-level directorial intent into technical AI prompts:
- Integrates character identity, outfit details, and location context
- Applies camera specifications and motion parameters
- Generates standardized prompt structure with aspect ratio and version tags

### 6.2 Feature Implementation Workflow
1. **Update Types**: Extend interfaces in `src/types/index.ts`
2. **Extend Store**: Add actions to Zustand store with proper typing
3. **Build Logic**: Implement utilities in `/src/utils/` with eCoT documentation
4. **Create UI**: Develop components in appropriate `/src/components/` directories
5. **Integration Testing**: Ensure workflow aligns with director-centric processes

## 7. Structured Innovation Roadmap

### Phase 1: Core Polish (Current)
- [x] "@" Tagging System Enhancement
- [x] Coverage Autocomplete for Shot Types
- [x] NLE Keyboard Shortcuts (J/K/L)
- [ ] **Frame Chaining Persistence** (Using approved Takes as Init Images)

### Phase 2: AI Orchestration Enhancements
- **Multi-Provider Support**: Seamless integration with Banana, Seedance, RunPod
- **Smart Prompt Translation**: Advanced natural language to technical prompt conversion
- **Dynamic Lighting Simulation**: Real-time lighting mood adjustments based on scene context

### Phase 3: Advanced Continuity Features
- **Temporal Consistency Engine**: Automatic frame alignment across shots
- **Character Arc Tracking**: Visual trait evolution across sequences
- **Scene Transition Intelligence**: Context-aware transition suggestions

### Phase 4: Creative Expansion
- **Automated Foley Generation**: Procedural sound effect creation synced to visual action
- **Collaborative Storyboarding**: Real-time multi-user script breakdown with AI suggestions
- **Virtual Production Integration**: AR/VR preview capabilities for set visualization

### Phase 5: Performance & Scale
- **Render Farm Management**: Distributed rendering across cloud providers
- **Batch Processing Pipeline**: Parallel shot processing with priority queuing
- **Usage Analytics Dashboard**: Usage pattern analysis for workflow optimization

## 8. Brainstorming & Automation Blueprint
For a detailed technical breakdown of upcoming intelligent studio features, refer to the **[AUTOMATION_BLUEPRINT.md](./AUTOMATION_BLUEPRINT.md)**.

1. **AI Director Assistant**: Context-aware suggestions during shot composition
2. **Style Transfer Studio**: Apply specific cinematographers' styles to generated footage
3. **Real-time Collaboration**: Multi-user scene editing with version control
4. **Automated Localization**: Instant lip-syncing and subtitle generation
5. **Emotion Tracking System**: Visual emotion analysis for character development

## 9. Technical Standards (Updated)
- **Strict Typing**: All functions, props, and state mutations must be explicitly typed
- **Performance Optimization**: Use `memo` and optimized selectors for store operations
- **Code Quality**: Enforce linting rules and type safety checks
- **Documentation Requirements**: All complex logic must include eCoT comments

## 10. Contact & Version Control
- **Lead Director**: [USER]
- **Version**: 5.1 (Expanded Documentation)
- **Last Updated**: 2026-04-26
- **Contact**: For architectural deviations or clarification

*This document serves as the living technical reference for all Cinematic.AI development. It should be updated regularly to reflect codebase changes and emerging best practices.*