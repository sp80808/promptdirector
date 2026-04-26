import { useStore } from "../../store";
import { Scene, Shot } from "../../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Clapperboard, Plus, Video, Trash2, GripVertical } from "lucide-react";

export function Timeline() {
  const { scenes, shots, moveShot, addShot, addScene, selectShot, selectedShotId } = useStore();

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

  return (
    <div className="flex-1 flex flex-col bg-ink-950 overflow-hidden">
      <div className="h-10 border-b border-line flex items-center px-4 gap-4 bg-ink-900 justify-between">
        <div className="flex items-center gap-4">
           <span className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Sequence Editor</span>
           <button 
             onClick={() => addScene("New Scene")}
             className="text-[10px] mono text-accent hover:underline flex items-center gap-1"
           >
             <Plus size={10} /> NEW SCENE
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
                <button 
                  onClick={() => addShot(scene.id, { title: "New Shot" })}
                  className="nle-button py-1 text-[10px]"
                >
                  <Plus size={10} /> ADD SHOT
                </button>
              </div>

              <Droppable droppableId={scene.id} direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex gap-3 overflow-x-auto pb-4 min-h-[160px]"
                  >
                    {scene.shotIds.map((shotId, index) => {
                      const shot = shots[shotId];
                      if (!shot) return null;
                      return (
                        <Draggable key={shot.id} draggableId={shot.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() => selectShot(shot.id)}
                              className={`w-64 h-40 shrink-0 nle-panel flex flex-col relative group transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50' : ''} ${selectedShotId === shot.id ? 'border-accent shadow-[0_0_10px_rgba(255,107,61,0.2)]' : 'hover:border-zinc-500'}`}
                            >
                              <div className="flex-1 bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
                                {shot.approvedTakeId ? (
                                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/mock-thumb.jpg)` }} />
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
                                <span className="text-[10px] font-bold text-zinc-400 truncate pr-2">{shot.title}</span>
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
                      );
                    })}
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
