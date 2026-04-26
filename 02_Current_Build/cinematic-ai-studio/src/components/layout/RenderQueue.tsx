import React, { useEffect, useRef } from "react";
import { useStore } from "../../store";
import { Loader2, CheckCircle2, AlertCircle, X, Clock, Play } from "lucide-react";
import { GenerationAPI } from "../../utils/api";

export function RenderQueue() {
  const state = useStore();
  const { renderQueue, shots, removeFromRenderQueue, updateRenderQueueItem, addTake, updateTake } = state;

  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingRef.current) return;
      
      const nextItem = renderQueue.find(q => q.status === "pending");
      if (!nextItem) return;

      isProcessingRef.current = true;
      updateRenderQueueItem(nextItem.id, { status: "processing", progress: 10 });

      const shot = shots[nextItem.shotId];
      if (!shot) {
        updateRenderQueueItem(nextItem.id, { status: "failed", error: "Shot not found" });
        isProcessingRef.current = false;
        return;
      }

      try {
        await GenerationAPI.renderShot(
          shot,
          state,
          (takeId) => {
            addTake(shot.id, { id: takeId, shotId: shot.id, seed: 0, status: "rendering", rating: 0, createdAt: Date.now() });
            updateRenderQueueItem(nextItem.id, { takeId, progress: 50 });
          },
          (takeId, updates) => {
            updateTake(shot.id, takeId, updates);
            if (updates.status === "rendered") {
              updateRenderQueueItem(nextItem.id, { status: "completed", progress: 100 });
            } else if (updates.status === "failed") {
              updateRenderQueueItem(nextItem.id, { status: "failed", progress: 100 });
            }
          }
        );
      } catch (e: any) {
        console.error("Render Queue Error:", e);
        updateRenderQueueItem(nextItem.id, { status: "failed", error: e.message });
      } finally {
        isProcessingRef.current = false;
      }
    };

    processQueue();
  }, [renderQueue, shots, state, updateRenderQueueItem, addTake, updateTake]);

  if (renderQueue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-ink-900 border border-line rounded-xl shadow-2xl overflow-hidden z-[60] flex flex-col max-h-[400px]">
      <div className="px-4 py-3 border-b border-line bg-ink-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-accent" />
          <h3 className="text-[10px] mono uppercase font-bold text-white tracking-widest">Active Jobs</h3>
        </div>
        <div className="flex items-center gap-2">
          {renderQueue.some(q => q.status === 'failed') && (
            <button 
              onClick={() => {
                renderQueue.forEach(q => {
                  if (q.status === 'failed') updateRenderQueueItem(q.id, { status: 'pending', progress: 0 });
                });
              }}
              className="text-[8px] mono text-red-400 hover:underline"
            >
              RETRY FAILED
            </button>
          )}
          <span className="text-[9px] mono bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">{renderQueue.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {renderQueue.map((item) => {
          const shot = shots[item.shotId];
          return (
            <div key={item.id} className="p-3 bg-ink-950 border border-line rounded-lg flex flex-col gap-2 group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-300 truncate w-40">{shot?.title || 'Unknown Shot'}</span>
                <button 
                  onClick={() => removeFromRenderQueue(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-ink-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${item.status === 'failed' ? 'bg-red-500' : 'bg-accent'}`}
                    style={{ width: `${item.status === 'completed' ? 100 : item.progress}%` }}
                  />
                </div>
                <div className="shrink-0">
                  {item.status === 'rendering' || item.status === 'processing' ? (
                    <Loader2 size={12} className="animate-spin text-accent" />
                  ) : item.status === 'completed' ? (
                    <CheckCircle2 size={12} className="text-lime-500" />
                  ) : item.status === 'failed' ? (
                    <AlertCircle size={12} className="text-red-500" />
                  ) : (
                    <Clock size={12} className="text-zinc-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] mono uppercase text-zinc-500">
                 <span>{item.status}</span>
                 <span>{item.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
