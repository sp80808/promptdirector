import React from 'react';
import { useStore } from '../../store';
import { RenderQueueItem } from '../../types';
import { Icons } from '../shared/Icons';

const statusColors: Record<RenderQueueItem['status'], string> = {
  pending: 'bg-zinc-600',
  queued: 'bg-yellow-500',
  rendering: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};

export const RenderQueuePanel: React.FC = () => {
  const renderQueue = useStore(s => s.renderQueue);
  const shots = useStore(s => s.shots);
  const removeFromRenderQueue = useStore(s => s.removeFromRenderQueue);
  const clearRenderQueue = useStore(s => s.clearRenderQueue);

  const pendingCount = renderQueue.filter(i => i.status === 'pending' || i.status === 'queued').length;
  const renderingCount = renderQueue.filter(i => i.status === 'rendering').length;
  const completedCount = renderQueue.filter(i => i.status === 'completed').length;

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-800">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Render className="w-4 h-4 text-blue-400" />
          <h3 className="font-medium text-sm">Render Queue</h3>
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded">{renderQueue.length}</span>
        </div>
        <button 
          onClick={clearRenderQueue}
          className="text-xs text-zinc-400 hover:text-white"
        >
          Clear
        </button>
      </div>

      <div className="p-2 border-b border-zinc-800 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-zinc-400">Pending</div>
          <div className="font-medium">{pendingCount}</div>
        </div>
        <div className="text-center">
          <div className="text-zinc-400">Rendering</div>
          <div className="font-medium text-blue-400">{renderingCount}</div>
        </div>
        <div className="text-center">
          <div className="text-zinc-400">Completed</div>
          <div className="font-medium text-green-400">{completedCount}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {renderQueue.length === 0 ? (
          <div className="text-center text-zinc-500 text-xs py-8">
            No renders in queue
          </div>
        ) : (
          renderQueue.map(item => {
            const shot = shots[item.shotId];
            return (
              <div key={item.id} className="bg-zinc-800/50 rounded p-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[item.status]}`} />
                    <span className="text-xs truncate max-w-[140px]">
                      {shot?.title || 'Unknown Shot'}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeFromRenderQueue(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white"
                  >
                    <Icons.Close className="w-3 h-3" />
                  </button>
                </div>

                {item.status === 'rendering' && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-zinc-700 rounded overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.progress}%</div>
                  </div>
                )}

                {item.error && (
                  <div className="mt-1 text-[10px] text-red-400">{item.error}</div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="p-2 border-t border-zinc-800">
        <button disabled={pendingCount === 0} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-xs font-medium rounded">
          Start Rendering
        </button>
      </div>
    </div>
  );
};