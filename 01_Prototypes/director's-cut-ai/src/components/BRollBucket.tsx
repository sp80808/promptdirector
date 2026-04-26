import { Play, Copy, Star } from 'lucide-react';

export function BRollBucket() {
  return (
    <div className="h-full flex flex-col bg-[#121212] border border-[#222] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#2D2D2D] pb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 italic underline underline-offset-4">B-Roll Bucket</h2>
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-[#1A1A1A] text-[9px] border border-[#333] rounded hover:border-orange-500 transition-colors uppercase font-bold text-slate-300">All Tags</button>
          <button className="px-2 py-1 bg-black text-[9px] border border-[#333] rounded hover:border-orange-500 transition-colors uppercase font-bold text-slate-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_4px_rgba(236,72,153,0.8)]"></span>
            Cyberpunk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
        {/* Placeholder Clip Card */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors">
          <div className="relative aspect-video bg-black border-b border-[#333]">
             <video 
              src="https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" 
              className="w-full h-full object-cover"
              controls
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" title="Cyberpunk"></span>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[9px] text-slate-400 leading-relaxed mb-3 line-clamp-3">
              <span className="text-orange-300 font-bold mr-1">[LLM OPTIMIZED]</span> 
              Extreme close-up on cybernetic eye. Neon reflections in the iris. Dolly push in, subtle lens flare. 4k, hyper-detailed.
            </p>
            <div className="flex items-center justify-between">
               <div className="flex gap-0.5">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <Star className="w-3 h-3 text-[#333]" />
                </div>
                <button className="text-[9px] text-slate-500 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors">
                  <Copy className="w-3 h-3" /> Copy
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
