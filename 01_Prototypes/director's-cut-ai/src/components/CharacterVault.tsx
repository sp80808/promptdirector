import { Plus, Copy } from 'lucide-react';

export function CharacterVault() {
  return (
    <div className="h-full flex flex-col bg-[#121212] border border-[#222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#2D2D2D] pb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 italic underline underline-offset-4">Character Vault</h2>
        <button className="text-orange-500 text-xs font-bold hover:text-orange-400 transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add Character
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2">
        {/* Placeholder Card */}
        <div className="p-3 bg-[#1A1A1A] border border-orange-500/30 rounded flex flex-col gap-3">
          <div className="aspect-[4/3] bg-black border border-[#333] rounded flex items-center justify-center p-4 text-center overflow-hidden relative">
            <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">[ Nano Banana Preview ]</span>
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" title="Cyberpunk"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" title="Protagonist"></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#333] rounded overflow-hidden flex items-center justify-center border border-[#444] shrink-0">
              <span className="text-[10px] text-slate-500 italic">8472</span>
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-white flex justify-between items-start">
                Sample Character
                <button className="text-slate-500 hover:text-orange-500 transition-colors" title="Copy Prompt Fragment">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[9px] text-slate-500 uppercase mt-0.5 font-mono">Soul ID: base-v1</div>
            </div>
          </div>
          
          <div className="bg-black/40 border border-[#222] p-2 rounded flex flex-col gap-2 mt-1">
            <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Prop / Outfit Variants</div>
            <div className="flex items-center justify-between group cursor-pointer hover:bg-[#1A1A1A] p-1 rounded transition-colors border border-transparent hover:border-[#333]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Base (Detective)</span>
              </div>
              <span className="text-[8px] font-mono text-slate-600 bg-black px-1 py-0.5 rounded group-hover:text-orange-500 transition-colors">Lora 0.8</span>
            </div>
            <div className="w-px h-2 bg-[#333] ml-1.5 -my-1"></div>
            <div className="flex items-center justify-between group cursor-pointer hover:bg-[#1A1A1A] p-1 rounded transition-colors border border-transparent hover:border-[#333]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">Space Suit</span>
              </div>
              <span className="text-[8px] font-mono text-slate-600 bg-black px-1 py-0.5 rounded group-hover:text-orange-500 transition-colors">Lora 0.9</span>
            </div>
            <div className="w-px h-2 bg-[#333] ml-1.5 -my-1"></div>
            <div className="flex items-center justify-between group cursor-pointer hover:bg-[#1A1A1A] p-1 rounded transition-colors border border-transparent hover:border-[#333]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 border-l border-b border-[#333] -ml-2 -mb-2"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-red-500 transition-colors"></div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">Damaged Helmet</span>
              </div>
              <span className="text-[8px] font-mono text-slate-600 bg-black px-1 py-0.5 rounded group-hover:text-red-500 transition-colors">Lora 1.0</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1 border-t border-[#222] pt-3">
            <span className="px-1.5 py-0.5 bg-black border-l-2 border-pink-500 text-slate-300 rounded-r text-[9px] uppercase font-bold tracking-wider">Cyberpunk</span>
            <span className="px-1.5 py-0.5 bg-black border-l-2 border-cyan-500 text-slate-300 rounded-r text-[9px] uppercase font-bold tracking-wider">Protagonist</span>
          </div>
        </div>
      </div>
    </div>
  );
}
