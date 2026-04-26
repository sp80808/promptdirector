import { Mic, Sparkles, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { ScriptBreakdownModal } from './ScriptBreakdownModal';
import { useStore } from '../store';

export function PromptMatrix() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const { sceneBlocks, shots } = useStore();

  const handleExportOTIO = () => {
    /* eCoT: Generate standard OpenTimelineIO JSON format */
    const otio = {
      "OTIO_SCHEMA": "Timeline.1",
      "name": "Exported Sequence",
      "tracks": {
        "OTIO_SCHEMA": "Stack.1",
        "children": [
          {
            "OTIO_SCHEMA": "Track.1",
            "kind": "Video",
            "children": Object.values(sceneBlocks).flatMap(block => 
              block.shotIds.map(shotId => {
                const shot = shots[shotId];
                return {
                  "OTIO_SCHEMA": "Clip.1",
                  "name": shot.rawPrompt || shot.id,
                  "media_reference": {
                    "OTIO_SCHEMA": "ExternalReference.1",
                    "target_url": shot.videoUrl || `placeholder_${shot.id}.mp4`
                  }
                };
              })
            )
          }
        ]
      }
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(otio, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "sequence.otio");
    dlAnchorElem.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        // handleGenerateVideo();
      } else {
        const key = e.key.toLowerCase();
        if (key === 'j') {
          if (videoRef.current) videoRef.current.currentTime -= 2;
        }
        if (key === 'k') {
          if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play();
            else videoRef.current.pause();
          }
        }
        if (key === 'l') {
          if (videoRef.current) videoRef.current.currentTime += 2;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#121212] border border-[#222] rounded-lg p-5 relative">
      <ScriptBreakdownModal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)} />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 italic underline underline-offset-4 mb-1">Canvas / Generator</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Build prompt matrix blocks and generate output</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsScriptModalOpen(true)}
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-orange-500 bg-[#1A1A1A] border border-[#333] hover:border-orange-500 px-3 py-1.5 rounded transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Auto-Storyboard
          </button>
          
          <button 
            onClick={handleExportOTIO}
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 bg-[#1A1A1A] border border-[#333] hover:border-blue-500 px-3 py-1.5 rounded transition-colors"
          >
            <Download className="w-3 h-3" /> Export .OTIO
          </button>

          <div className="bg-black border border-[#333] rounded px-3 py-1.5 flex items-center gap-2 ml-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Seedance 2.0</span>
          </div>
        </div>
      </div>

      {/* Audio Reference Track */}
      <div className="h-16 bg-[#1A1A1A] border border-[#222] rounded flex items-center shrink-0 mb-4 overflow-hidden relative group">
        <div className="w-48 h-full border-r border-[#333] bg-[#121212] p-3 flex flex-col justify-center shrink-0 z-10">
          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5"><Mic className="w-3 h-3" /> Audio Scrub</span>
          <button className="text-[9px] text-orange-500 hover:text-orange-400 mt-1 uppercase font-bold tracking-wider text-left">Upload Track</button>
        </div>
        <div className="flex-1 h-full relative border-b border-[#333]/50 flex items-center px-4 opacity-50 overflow-hidden cursor-ew-resize">
          <div className="w-full h-8 flex items-center justify-between gap-1 opacity-60">
            {Array.from({length: 120}).map((_, i) => (
              <div key={i} className="w-1 bg-orange-600/40 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
            ))}
          </div>
          {/* Playhead */}
          <div className="absolute top-0 bottom-0 w-px bg-orange-500 left-[20%]">
            <div className="absolute top-0 -left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Kanban / Timeline Track */}
      <div className="flex-1 overflow-hidden min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
