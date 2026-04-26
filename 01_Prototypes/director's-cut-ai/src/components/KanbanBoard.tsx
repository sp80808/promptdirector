import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store';
import { SmartPromptInput } from './SmartPromptInput';
import { Copy, SplitSquareHorizontal, Play, Sparkles, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { ShotCard } from './ShotCard';

export function KanbanBoard() {
  const { sceneBlocks, shots, moveShot } = useStore();
  const [isOptimizing, setIsOptimizing] = useState<Record<string, boolean>>({});

  const handleDragEnd = (result: DropResult) => {
    /* eCoT: 
     * 1. Extract source and destination coordinates from DnD completion event.
     * 2. If dropped globally outside a configured Droppable, abort.
     * 3. Execute `moveShot` Zustand action, safely mutating standard arrays.
     * 4. (Future) Immediately trigger continuity sweep for newly adjacent shots resolving spatial invariants.
    */
    if (!result.destination) return;

    moveShot(
      result.draggableId,
      result.source.droppableId,
      result.destination.droppableId,
      result.source.index,
      result.destination.index
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {Object.values(sceneBlocks).map((block) => (
          <div key={block.id} className="w-[450px] shrink-0 flex flex-col bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden h-full">
            <div className="p-3 bg-[#121212] border-b border-[#222] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{block.title}</h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Rhythm: {block.rhythmPreset}</p>
              </div>
              <button className="text-[10px] bg-black border border-[#333] hover:border-orange-500 text-orange-500 px-3 py-1.5 rounded uppercase font-bold tracking-widest transition-colors mb-auto">
                + Auto-Coverage
              </button>
            </div>
            
            <Droppable droppableId={block.id} type="SHOT">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-[#1a1a1a]/50' : ''}`}
                >
                  {block.shotIds.map((shotId, index) => (
                    <ShotCard 
                      key={shotId} 
                      shotId={shotId} 
                      index={index} 
                      nextShotId={block.shotIds[index + 1]} 
                    />
                  ))}
                  {provided.placeholder}
                  
                  {block.shotIds.length === 0 && (
                     <div className="border-2 border-dashed border-[#222] bg-[#0A0A0A] rounded-lg p-8 flex flex-col items-center justify-center opacity-60 mt-4 min-h-[100px]">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Drag shots here to build</p>
                     </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
