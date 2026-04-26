import React, { useState, useMemo } from "react";
import { useStore } from "../../store";
import { Search, Grid, List, Film, User, MapPin, Trash2, CheckCircle2, Download, ExternalLink } from "lucide-react";

export function AssetVault() {
  const { shots, characters, locations, setModal } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "images" | "videos">("all");

  // Flatten all takes from all shots
  const allAssets = useMemo(() => {
    const assets: any[] = [];
    Object.values(shots).forEach(shot => {
      shot.takes.forEach(take => {
        assets.push({
          ...take,
          shotTitle: shot.title,
          isApproved: shot.approvedTakeId === take.id,
          locationId: shot.locationId,
          characterIds: shot.characterIds
        });
      });
    });
    return assets.sort((a, b) => b.createdAt - a.createdAt);
  }, [shots]);

  const filteredAssets = useMemo(() => {
    return allAssets.filter(asset => {
      const matchesSearch = asset.shotTitle.toLowerCase().includes(search.toLowerCase()) || 
                          asset.metadata?.prompt?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === "all" || 
                          (filter === "approved" && asset.isApproved) ||
                          (filter === "images" && !asset.videoUrl) ||
                          (filter === "videos" && asset.videoUrl);
      
      return matchesSearch && matchesFilter;
    });
  }, [allAssets, search, filter]);

  return (
    <div className="flex flex-col h-full bg-ink-950 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-ink-900">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Project Asset Vault
          </h2>
          <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Centralized media management & discovery</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
             <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search prompts or shots..."
               className="nle-input pl-9 w-64 h-9"
             />
           </div>
           <div className="flex bg-ink-800 rounded-lg p-1 border border-line">
              {(['all', 'approved', 'images', 'videos'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[10px] mono uppercase font-bold rounded-md transition-all ${filter === f ? 'bg-accent text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map(asset => (
            <div 
              key={asset.id} 
              className={`group nle-panel p-0 overflow-hidden bg-black border transition-all ${asset.isApproved ? 'border-accent/50' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className="aspect-video relative overflow-hidden bg-ink-900 cursor-pointer" onClick={() => setModal({ kind: 'media_viewer', takeId: asset.id, shotId: asset.shotId })}>
                {asset.videoUrl ? (
                  <video src={asset.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                ) : (
                  <img src={asset.thumbUrl || asset.fullImageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                )}
                
                {asset.isApproved && (
                  <div className="absolute top-2 right-2 bg-accent text-black rounded-full p-1 shadow-lg">
                    <CheckCircle2 size={12} />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                   <div className="flex gap-1.5">
                      <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-white">
                        <Download size={12} />
                      </button>
                      <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-white">
                        <ExternalLink size={12} />
                      </button>
                   </div>
                   <button className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors text-red-400">
                      <Trash2 size={12} />
                   </button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white truncate">{asset.shotTitle}</span>
                  <span className="text-[8px] mono text-zinc-500 uppercase tracking-tighter">Take: {asset.id.slice(0, 8)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                   {asset.characterIds?.map((cid: string) => {
                     const char = characters.find(c => c.id === cid);
                     return char ? (
                       <div key={cid} className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                          <User size={8} className="text-cyan-400" />
                          <span className="text-[7px] mono text-cyan-400 font-bold uppercase">{char.name}</span>
                       </div>
                     ) : null;
                   })}
                   {asset.locationId && (
                     <div className="px-1.5 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center gap-1">
                        <MapPin size={8} className="text-lime-400" />
                        <span className="text-[7px] mono text-lime-400 font-bold uppercase">{locations.find(l => l.id === asset.locationId)?.name}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-20">
               <Film size={64} className="mb-4" />
               <p className="mono text-xs uppercase tracking-widest font-bold">No assets found matching criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
