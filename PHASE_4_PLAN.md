# Cinematic.AI Phase 4: Production Intelligence & Orchestration
**Topic**: Auto-Storyboarding, Continuity Logic, and Task Queuing

This plan outlines the implementation of advanced AI orchestration to ensure narrative flow, visual consistency, and efficient generation management.

---

## 1. Advanced Auto-Storyboarding & Shot Selection

### 1.1 Narrative-to-Optics Engine
The current breakdown logic extracts simple shot descriptions. Phase 4 will implement a **Cinematic Intelligence Layer**:
- **Intensity Mapping**: Analyze script dialogue/action to determine "Emotional Heat". High intensity = tighter shots (ECU/CU); Low intensity = wider shots (Wide/Medium).
- **Coverage Packs**: Automatically generate standard coverage for a scene:
  - `MASTER`: Establishing Wide.
  - `REVERSE`: Over-the-shoulder (OTS) for dialogue.
  - `REACTION`: Close-up on the non-speaking character.
- **Automatic Camera Motifs**: Assign camera movement (Dolly, Pan, Handheld) based on scene genre (e.g., Action = Handheld/Shaky; Drama = Slow Dolly).

### 1.2 The "Shot Matrix" UI
A new inspector panel that allows directors to "Roll for Coverage":
- **Re-Roll Shot**: Regenerate the prompt with a different cinematic angle while keeping the subject.
- **Sequence Suggestion**: Suggest the next logical shot based on traditional editing rules (e.g., don't jump from Extreme Wide to Extreme Close-up).

---

## 2. The Continuity & Consistency System

### 2.1 The "Visual DNA" Injector
To ensure Scene N looks like Scene N+1:
- **Global Scene Styles**: Define a `SceneStyle` object (Color Palette, Lighting, Film Stock) that is strictly injected into every shot prompt within that scene.
- **Face Locking (SoulID)**: Force the inclusion of the Master Character Seed and high-weight Reference Images in all generations.
- **Frame Chaining (Temporal Continuity)**:
  - Use the last frame of Shot A (Approved Take) as the `init_image` for Shot B.
  - Calculate `motion_bucket_id` based on the previous shot's speed.

### 2.2 Post-Gen Continuity Audit (Vision-AI)
Use Gemini 2.0 Flash Vision to compare the generated video against the "Scene Bible":
- **Wardrobe Check**: "Did Sarah's jacket change color?"
- **Lighting Check**: "Is the light coming from the wrong side?"
- **UI Feedback**: Flag shots in the timeline with a ⚠️ warning if continuity score is low (< 70%).

---

## 3. The Generation Task Queue (Queuing)

### 3.1 Task Orchestrator
A robust queue management system in the Zustand store:
- **Prioritization**: Priority 1 = Active Shot (User waiting); Priority 10 = Background Storyboard rendering.
- **Provider Load Balancing**: 
  - **Seedance/Wan**: Best for high-quality character shots.
  - **SiliconFlow/Hunyuan**: Best for environmental B-roll.
  - **Runway Gen-3**: Best for complex motion.

### 3.2 Real-time Progress Tracking
- **Timeline Progress Bars**: Visual feedback on each shot card showing rendering status.
- **Batch Actions**: "Render Scene", "Render All Approved", "Re-render with New Seed".

---

## 4. Implementation Steps (Phased)

1.  **Step 4.1**: Upgrade `src/services/ai.ts` with "Shot Logic" prompts and "Intensity Mapping".
2.  **Step 4.2**: Implement the `RenderQueue` logic in `src/store/index.ts`.
3.  **Step 4.3**: Build the **Generation Dashboard** modal for tracking large-scale renders.
4.  **Step 4.4**: Implement the **Vision Continuity Auditor** service.

---
*Note: This plan is subject to architectural review. Directors (USER) please provide feedback on the "Coverage Pack" logic.*
