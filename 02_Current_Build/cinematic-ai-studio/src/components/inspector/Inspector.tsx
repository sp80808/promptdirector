import React, { useState } from "react";
import { useStore } from "../../store";
import { Shot, Character, Location, ShotSettings } from "../../types";
import MentionTextarea from "../shared/MentionTextarea";
import { GenerationAPI } from "../../utils/api";
import { 
  CheckCircle2, 
  Clock, 
  Film,
  Camera,
  Move,
  Sparkles,
  MapPin,
  User,
  Settings2,
  Maximize2,
  Play
} from "lucide-react";

export function Inspector() {
  const state = useStore();
  const { shots, selectedShotId, characters, locations, updateShot, addShot, addTake, updateTake, approveTake, setModal } = state;
  const shot = selectedShotId ? shots[selectedShotId] : null;

  const [isRendering, setIsRendering] = useState(false);

  if (!shot) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30">
        <Film size={48} className="mb-4" />
        <p className="mono text-[10px] uppercase tracking-widest">Select a shot in the timeline to inspect properties</p>
      </div>
    );
  }

  const handleUpdate = (p: Partial<Shot>) => {
    if (selectedShotId) updateShot(selectedShotId, p);
  };

  const handleUpdateSettings = (s: Partial<ShotSettings>) => {
    if (selectedShotId) updateShot(selectedShotId, { settings: { ...shot.settings, ...s } });
  };

  const handleRender = async () => {
    setIsRendering(true);
    await GenerationAPI.renderShot(
      shot,
      state,
      (takeId) => addTake(shot.id, { id: takeId, shotId: shot.id, seed: 0, status: "rendering", rating: 0, createdAt: Date.now() }),
      (takeId, updates) => updateTake(shot.id, takeId, updates)
    );
    setIsRendering(false);
  };

  return (
    <div className="h-full flex flex-col bg-ink-900 border-l border-line">
      <div className="p-4 border-b border-line flex items-center justify-between bg-ink-850 shrink-0">
        <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Shot Inspector</h2>
        <span className="text-[9px] mono text-accent px-1.5 py-0.5 rounded bg-accent/10">ID: {shot.id.slice(0, 5)}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <section className="space-y-2">
          <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Shot Title</label>
          <input 
            value={shot.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className="nle-input font-bold"
          />
        </section>

        {/* Smart Prompt */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[9px] mono uppercase text-zinc-500 font-bold flex items-center gap-1">
              <Sparkles size={10} className="text-accent" /> Smart Prompt
            </label>
          </div>
          <MentionTextarea 
            value={shot.rawPrompt}
            onChange={(v) => handleUpdate({ rawPrompt: v })}
            placeholder="Type @ to mention characters, outfits or locations..."
            rows={4}
          />
        </section>

        {/* Optics & Motion */}
        <div className="grid grid-cols-2 gap-3">
          <section className="space-y-2">
            <label className="text-[9px] mono uppercase text-zinc-500 font-bold flex items-center gap-1">
              <Camera size={10} /> Optics
            </label>
            <input 
              value={shot.optics}
              onChange={(e) => handleUpdate({ optics: e.target.value })}
              className="nle-input text-[11px]"
              placeholder="e.g. 35mm Anamorphic"
            />
          </section>
          <section className="space-y-2">
            <label className="text-[9px] mono uppercase text-zinc-500 font-bold flex items-center gap-1">
              <Move size={10} /> Motion
            </label>
            <input 
              value={shot.motion}
              onChange={(e) => handleUpdate({ motion: e.target.value })}
              className="nle-input text-[11px]"
              placeholder="e.g. Slow Dolly In"
            />
          </section>
        </div>

        {/* Advanced Settings */}
        <section className="space-y-3 pt-2">
          <h3 className="text-[9px] mono uppercase tracking-widest text-zinc-600 font-bold border-b border-line pb-1 flex items-center gap-1">
            <Settings2 size={10} /> Generation Settings
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] mono uppercase text-zinc-500">Model</label>
              <select 
                value={shot.settings?.model || "black-forest-labs/FLUX.1-schnell"}
                onChange={(e) => handleUpdateSettings({ model: e.target.value })}
                className="nle-input text-[10px] py-1"
              >
                <option value="black-forest-labs/FLUX.1-schnell">FLUX.1-schnell</option>
                <option value="black-forest-labs/FLUX.1-dev">FLUX.1-dev</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] mono uppercase text-zinc-500">Aspect Ratio</label>
              <select 
                value={shot.settings?.aspectRatio || "16:9"}
                onChange={(e) => handleUpdateSettings({ aspectRatio: e.target.value as any })}
                className="nle-input text-[10px] py-1"
              >
                <option value="16:9">16:9 (Cinematic)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="9:16">9:16 (Vertical)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] mono uppercase text-zinc-500 flex justify-between">
                <span>CFG Scale</span>
                <span className="text-accent">{shot.settings?.cfgScale || 4.5}</span>
              </label>
              <input 
                type="range" min="1" max="20" step="0.5"
                value={shot.settings?.cfgScale || 4.5}
                onChange={(e) => handleUpdateSettings({ cfgScale: parseFloat(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] mono uppercase text-zinc-500 flex justify-between">
                <span>Steps</span>
                <span className="text-accent">{shot.settings?.steps || 20}</span>
              </label>
              <input 
                type="range" min="10" max="50" step="1"
                value={shot.settings?.steps || 20}
                onChange={(e) => handleUpdateSettings({ steps: parseInt(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>
          </div>
        </section>

        {/* Takes Gallery */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-line pb-1">
            <h3 className="text-[9px] mono uppercase tracking-widest text-zinc-600 font-bold">Takes ({shot.takes.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {shot.takes.map(take => (
              <div 
                key={take.id} 
                onClick={() => {
                  if (take.status === 'rendered') {
                    setModal({ kind: 'media_viewer', takeId: take.id, shotId: shot.id });
                  }
                }}
                className={`aspect-video bg-ink-950 border rounded overflow-hidden relative group cursor-pointer transition-all ${shot.approvedTakeId === take.id ? 'border-accent' : 'border-line hover:border-zinc-600'}`}
              >
                {take.videoUrl ? (
                  <>
                    <video src={take.videoUrl} className="w-full h-full object-cover" muted loop />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Play size={12} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : take.thumbUrl ? (
                  <img src={take.thumbUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                     <Clock size={16} className={`mb-1 ${take.status === 'rendering' ? 'text-accent animate-pulse' : 'text-zinc-800'}`} />
                     <span className="text-[8px] mono text-zinc-700 uppercase">{take.status}</span>
                  </div>
                )}
                {shot.approvedTakeId === take.id && (
                  <div className="absolute top-1 right-1 bg-accent text-black rounded-full p-0.5 z-10">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                   {take.status === 'rendered' && (
                     <>
                       <button 
                         onClick={(e) => { e.stopPropagation(); approveTake(shot.id, take.id); }}
                         className="nle-button py-0 px-2 text-[8px] bg-ink-800/80"
                       >
                         APPROVE
                       </button>
                       <button className="nle-button py-0 px-1 text-[8px] bg-ink-800/80">
                         <Maximize2 size={10} />
                       </button>
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-line bg-ink-850 shrink-0">
        <button 
          onClick={handleRender}
          disabled={isRendering}
          className="w-full bg-accent text-black font-bold py-2 rounded text-xs hover:bg-accent/90 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(255,107,61,0.2)] disabled:opacity-50 disabled:shadow-none"
        >
          {isRendering ? 'GENERATING...' : 'RENDER SELECTED SHOT'}
        </button>
      </div>
    </div>
  );
}
