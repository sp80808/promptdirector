import { Plus, Copy } from 'lucide-react';

export function LocationScout() {
  return (
    <div className="h-full flex flex-col bg-[#121212] border border-[#222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#2D2D2D] pb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 italic underline underline-offset-4">Location Scout</h2>
        <button className="text-orange-500 text-xs font-bold hover:text-orange-400 transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2">
        {/* Placeholder Card */}
        <div className="p-3 bg-[#1A1A1A] border border-orange-500/30 rounded flex flex-col gap-3">
          <div className="aspect-video bg-black border border-[#333] rounded flex items-center justify-center p-4 text-center overflow-hidden relative">
            <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">[ Environment Preview ]</span>
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" title="Cyberpunk"></span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Establishing Shot"></span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <h3 className="text-[11px] font-bold text-white uppercase">Neon Alleyway</h3>
              <button className="text-slate-500 hover:text-orange-500 transition-colors" title="Copy Prompt Fragment">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[9px] text-slate-500 uppercase">Wide Angle / Night</div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1 border-t border-[#222] pt-3">
            <span className="px-1.5 py-0.5 bg-black border-l-2 border-pink-500 text-slate-300 rounded-r text-[9px] uppercase font-bold tracking-wider">Cyberpunk</span>
            <span className="px-1.5 py-0.5 bg-black border-l-2 border-[#10b981] text-slate-300 rounded-r text-[9px] uppercase font-bold tracking-wider">Est. Shot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
