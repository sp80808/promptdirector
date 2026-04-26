import { useStore } from "../../store";
import { Scene, Shot } from "../../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Clapperboard, Plus, Video, Trash2, GripVertical, PlayCircle, Sparkles, Wand2 } from "lucide-react";
import { IconSparkle } from "../shared/Icons";
import { getShotSuggestionsForTimeline, applyTopSuggestion } from "../../utils/automation/engine";
import React from "react";

export function Timeline() {
  const { scenes, shots, moveShot, addShot, addScene, selectShot, selectedShotId, batchAddToRenderQueue, applySuggestion, automationConfig } = useStore();
  
  // Auto-run shot suggester when shot is selected (debounced)
  React.useEffect(() => {
    if (!selectedShotId || !automationConfig.shotSuggester?.enabled) return;
    
    const timer = setTimeout(async () => {
      // Trigger automation for this shot
      const { runAutomationForShot } = await import('../../utils/automation/engine');
      await runAutomationForShot(selectedShotId);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedShotId, automationConfig.shotSuggester?.enabled]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    moveShot(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleRenderScene = (scene: Scene) => {
    const unrenderedShots = scene.shotIds.filter(id => {
      const shot = shots[id];
      return shot && !shot.approvedTakeId;
    });
    
    if (unrenderedShots.length > 0) {
      batchAddToRenderQueue(unrenderedShots);
    } else {
      alert("All shots in this scene already have an approved take.");
    }
  };

  const handleAutoDirectScene = async (scene: Scene) => {
    if (!useStore.getState().apiKeys.siliconFlow) {
      alert("Auto-Director requires API keys to be configured.");
      return;
    }
    // We run it async so it doesn't block the UI thread completely,
    // though the browser might complain if we don't handle state properly.
    AutoDirector.produceScene(scene.id, useStore).catch(console.error);
  };

  return (
    <div className="flex-1 flex flex-col bg-ink-950 overflow-hidden">
      <div className="h-10 border-b border-line flex items-center px-4 gap-4 bg-ink-900 justify-between">
        <div className="flex items-center gap-4">
           <span className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Sequence Editor</span>
           <button 
             onClick={() => addScene("New Scene")}
             className="text-[10px] mono text-zinc-500 hover:text-accent hover:underline flex items-center gap-1 transition-all"
           >
             <Plus size={10} /> NEW SCENE
           </button>
           <div className="h-3 w-[1px] bg-white/10" />
           <button 
             onClick={() => useStore.getState().setModal({ kind: "script_breakdown" })}
             className="text-[10px] mono text-accent hover:underline flex items-center gap-1 transition-all"
           >
             <IconSparkle size={10} /> AUTO-STORYBOARD
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <DragDropContext onDragEnd={onDragEnd}>
          {scenes.map((scene) => (
            <section key={scene.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-ink-800 border border-line rounded flex items-center justify-center">
                    <Clapperboard size={12} className="text-zinc-500" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{scene.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAutoDirectScene(scene)}
                    className="nle-button py-1 text-[10px] flex items-center gap-1 border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <Sparkles size={10} /> AUTO-DIRECT
                  </button>
                  <button 
                    onClick={() => handleRenderScene(scene)}
                    className="nle-button py-1 text-[10px] flex items-center gap-1 border-accent/20 text-accent hover:bg-accent/10"
                  >
                    <PlayCircle size={10} /> RENDER SCENE
                  </button>
                  <button 
                    onClick={() => addShot(scene.id, { title: "New Shot" })}
                    className="nle-button py-1 text-[10px] flex items-center gap-1"
                  >
                    <Plus size={10} /> ADD SHOT
                  </button>
                </div>
              </div>

               <Droppable droppableId={scene.id} direction="horizontal">
                 {(provided) => (
                   <div 
                     {...provided.droppableProps}
                     ref={provided.innerRef}
                     className="flex gap-3 items-start overflow-x-auto pb-4 min-h-[160px]"
                   >
                     {scene.shotIds.map((shotId, index) => {
                       const shot = shots[shotId];
                       if (!shot) return null;
                       
                       // Get suggestions for this shot (for inserting AFTER it)
                       const suggestions = getShotSuggestionsForTimeline(shotId);
                       
                       return (
                         <React.Fragment key={shot.id}>
                           <Draggable key={shot.id} draggableId={shot.id} index={index}>
                             {(provided, snapshot) => (
                               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 onClick={() => selectShot(shot.id)}
                                 className={`w-64 h-40 shrink-0 nle-panel flex flex-col relative group transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50' : ''} ${selectedShotId === shot.id ? 'border-accent shadow-[0_0_10px_rgba(255,107,61,0.2)]' : 'hover:border-zinc-500'}`}
                               >
                                 <div className="flex-1 bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
                                   {shot.approvedTakeId && shot.takes.find(t => t.id === shot.approvedTakeId) ? (
                                     (() => {
                                       const approvedTake = shot.takes.find(t => t.id === shot.approvedTakeId)!;
                                       if (approvedTake.videoUrl) {
                                         return (
                                           <>
                                             <video src={approvedTake.videoUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                             <div className="absolute inset-0 bg-black/20" />
                                           </>
                                         );
                                       }
                                       return (
                                         <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${approvedTake.thumbUrl || approvedTake.fullImageUrl})` }} />
                                       );
                                     })()
                                   ) : (
                                     <>
                                       <Video size={32} className="text-zinc-800 mb-2" />
                                       <span className="text-[9px] mono text-zinc-700 uppercase">No Takes</span>
                                     </>
                                   )}
                                   <div {...provided.dragHandleProps} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <GripVertical size={14} className="text-zinc-500 cursor-grab" />
                                   </div>
                                 </div>
                                  <div className="h-10 bg-ink-900 border-t border-line px-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[10px] font-bold text-zinc-400 truncate">{shot.title}</span>
                                      {suggestions.length > 0 && (
                                        <span className="text-[8px] px-1 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 flex items-center gap-1 shrink-0">
                                          <Sparkles size={8} /> +{suggestions.length}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] mono text-zinc-600">00:04</span>
                                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                             </div>
                           )}
                         </Draggable>
                         
                         {/* Suggestion Slot - appears after shot */}
                         {suggestions.length > 0 && (
                           <div className="shrink-0 w-12 flex flex-col gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                             {suggestions.slice(0, 2).map(s => {
                               const data = JSON.parse(s.suggested);
                               return (
                                 <button
                                   key={s.id}
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     // Apply suggestion: adds new shot at next index
                                     const scene = scenes.find(sc => sc.id === shot.sceneId);
                                     if (scene) {
                                       const newIndex = scene.shotIds.indexOf(shotId) + 1;
                                       
                                       // Create shot with suggestion data
                                       const newShotId = addShot(scene.id, {
                                         title: data.title,
                                         characterIds: shot.characterIds,
                                         outfitIds: shot.outfitIds,
                                         locationId: shot.locationId,
                                         rawPrompt: data.promptFragment,
                                         optics: data.optics,
                                         motion: data.motion,
                                       });
                                       
                                       // Mark suggestion as applied
                                       applySuggestion(s.id);
                                       
                                       // Select the new shot
                                       selectShot(newShotId);
                                     }
                                   }}
                                   className="w-10 h-8 rounded bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all flex items-center justify-center group/pill"
                                   title={`${data.reason || 'Add suggestion'}\n${data.shotType || ''}`}
                                 >
                                   <Plus size={12} className="group-hover/pill:rotate-90 transition-transform" />
                                 </button>
                               );
                             })}
                           </div>
                         )}
                       </React.Fragment>
                     ))}
                     {provided.placeholder}
                     {scene.shotIds.length === 0 && (
                      <div className="w-full h-40 border-2 border-dashed border-line rounded-lg flex items-center justify-center opacity-30">
                        <p className="mono text-[10px] uppercase">Drop shots here or click Add Shot</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </section>
          ))}
        </DragDropContext>
        
        {scenes.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <Clapperboard size={64} className="mb-4" />
            <p className="mono text-xs uppercase tracking-widest">Create a scene to start sequencing</p>
          </div>
        )}
      </div>
    </div>
  );
}
