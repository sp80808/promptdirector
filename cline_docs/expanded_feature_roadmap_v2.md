# Cinematic.AI v5.0 Expanded Feature Roadmap v2

## ✅ Foundation Complete
- [x] Core data models extended
- [x] Render queue system implemented
- [x] Continuity tracking architecture
- [x] Batch operations support

---

## 🎬 PHASE 6: ADVANCED CINEMATIC FEATURES (NEXT)

### 🟢 HIGH PRIORITY

#### 1. Automatic Shot Coverage Generator
**Status:** Planned
- When creating any shot, auto-suggest standard cinematic coverage:
  - Master Wide Shot
  - Over The Shoulder (OTS)
  - Close Up (CU) on performer
  - Reaction shot of other character
  - Insert / Cutaway
- Each suggested shot inherits characters, location, prompt context
- One-click add all suggested shots to timeline
- Configurable coverage presets per scene type

#### 2. Frame Chaining Engine
**Status:** Architecture complete
- Automatic detection of approved take final frame
- Auto inject as `init_image` to next shot in sequence
- Visual indicator on timeline shots with chain link icon
- Manual override toggle per shot
- Chain breaking warning when shots are reordered
- 3 strength levels: low / medium / high visual continuity

#### 3. Real-time Continuity Validator
**Status:** Architecture complete
- Background scanner that runs on timeline changes
- Checks for:
  ✅ Character outfit consistency across shots
  ✅ Location / time of day matches
  ✅ Lighting mood continuity
  ✅ Prop presence between shots
  ✅ Character position / screen direction
- Issues are shown inline on shot cards with severity indicators
- Auto-fix suggestions for common issues
- One-click "validate entire sequence"

#### 4. Batch Render Queue Dashboard
**Status:** Backend complete
- Dedicated panel showing all pending / rendering jobs
- Priority reordering via drag & drop
- Real-time progress bars per render
- Pause / cancel individual jobs
- Retry failed renders
- Estimated remaining time calculation
- System load indicator

---

### 🟡 MEDIUM PRIORITY

#### 5. Cinematic DNA System
- Extract style fingerprint from any film reference
- Store director / cinematographer presets
- Apply entire visual language to sequence with one click
- Adjustable blend strength
- Includes: lens choice, movement style, lighting ratios, colour grading, shot duration patterns, cut rhythm

#### 6. Shot Template Library
- Save complete shot presets (camera settings, lens, motion, model parameters)
- Community presets for common shot types
- "Golden Hour Interior", "Neo Noir Night", "Anamorphic Epic"
- Apply template to any shot instantly
- User custom templates

#### 7. Timeline Keyboard NLE Hotkeys
```
SPACE   - Play / pause timeline
DEL     - Delete selected shot
CMD+D   - Duplicate shot
[ / ]   - Nudge shot left / right
+ / -   - Zoom timeline
F       - Fit timeline to view
L       - Lock / unlock shot
M       - Add marker
```

#### 8. Notes & Annotation Layer
- Attach comments directly to shots, takes, characters
- Resolve / open comment threads
- Timestamped notes on video takes
- Mark shots as: To Do / In Progress / Review / Approved
- Colour coded status indicators

---

### 🔴 FUTURE PHASE

#### 9. Script Import & Breakdown
- Paste screenplay text
- Auto parse scene headings, action, dialogue
- Generate initial shot list automatically
- Extract characters, locations, props
- Estimate shot timing from script pacing

#### 10. Export System
- **EDL Export** - Edit Decision List for importing into Premiere / Resolve
- **Timeline Screenshot** - High res render of full timeline
- **Production Report** - PDF with all shots, takes, settings
- **Render Manifest** - CSV of all generation parameters
- **Final Sequence Render** - Stitch all approved takes into full video

#### 11. Character Memory Arc
- Track character emotional state across scenes
- Track injuries, costume changes, objects held
- Auto inject state changes into prompts automatically
- Character timeline showing state progression

#### 12. Transition Library
- Visual picker for cinematic transitions
- Preset descriptions: cut, dissolve, fade, match cut, cut on action, wipe, iris
- Each transition includes generation prompts to create smooth transition frames

---

## 📊 Technical Implementation Order

| Sprint | Features |
|---|---|
| **Sprint 1** | Batch Render Queue UI + Frame Chaining |
| **Sprint 2** | Continuity Check Engine |
| **Sprint 3** | Automatic Shot Coverage Generator |
| **Sprint 4** | Keyboard Shortcuts + Timeline Optimizations |
| **Sprint 5** | Cinematic DNA System |
| **Sprint 6** | Script Import |
| **Sprint 7** | Export System |

---

## 🧱 Required Technical Additions:
- [x] Shot type fields added
- [x] Render queue state
- [x] Continuity issue types
- [ ] Undo / Redo history stack
- [ ] Keyboard event bus
- [ ] Project metadata store
- [ ] Background job worker

---

*Last Updated: 26/04/2026*