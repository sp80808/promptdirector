import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { Shot, Character, Location, ShotSettings } from "../../types";
import MentionTextarea from "../shared/MentionTextarea";
import { GenerationAPI } from "../../utils/api";
import { generateSmartCoverage } from "../../services/ai";
import { runAutomationForShot } from "../../utils/automation/engine";
import { ContinuityPanel } from "./ContinuityPanel";
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
  Play,
  Loader2,
  Timer,
  Link2,
  Wand2,
  Volume2,
  Music,
  Waves
} from "lucide-react";

export function Inspector() {
  const state = useStore();
  const { shots, selectedShotId, characters, locations, updateShot, addShot, addTake, updateTake, approveTake, setModal, automationSuggestions, applySuggestion, dismissSuggestion } = state;
  const shot = selectedShotId ? shots[selectedShotId] : null;

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [renderStatus, setRenderStatus] = useState<"idle" | "queued" | "rendering" | "completed" | "failed">("idle");
  
  // Automation state
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Automation states
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Get relevant suggestions for current shot
  const suggestions = selectedShotId 
    ? automationSuggestions.filter(s => s.shotId === selectedShotId && !s.applied && !s.dismissed)
    : [];
  const promptSuggestion = suggestions.find(s => s.type === 'prompt_enhancement');

  // Subscribe to take status changes for the current shot
  React.useEffect(() => {
    if (!shot) return;
    
    // Check if any take is currently rendering
    const renderingTake = shot.takes.find(t => t.status === "rendering");
    const failedTake = shot.takes.find(t => t.status === "failed");
    const completedTake = shot.takes.find(t => t.status === "rendered");
    
    if (renderingTake) {
      setIsRendering(true);
      setRenderStatus("rendering");
      setRenderProgress(renderingTake.progress || 0);
    } else if (failedTake) {
      setIsRendering(false);
      setRenderStatus("failed");
      setRenderProgress(null);
    } else if (completedTake && !isRendering) {
      setRenderStatus("completed");
      setRenderProgress(null);
    } else {
      setIsRendering(false);
      setRenderStatus("idle");
      setRenderProgress(null);
    }
  }, [shot?.takes]);
  const [isSuggesting, setIsSuggesting] = useState(false);

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

  const handleGenerateAudio = async (takeId: string) => {
    await GenerationAPI.renderAudio(shot!, takeId, state, (tid, updates) => updateTake(shot!.id, tid, updates));
  };

  const handleSmartCoverage = async () => {
    if (!state.apiKeys.google) {
      alert("Configure Google AI Key for coverage suggestions.");
      return;
    }
    setIsSuggesting(true);
    try {
      const charNames = shot.characterIds.map(id => characters.find(c => c.id === id)?.displayName || "Unknown");
      const suggestions = await generateSmartCoverage(state.apiKeys.google, shot.rawPrompt, charNames);
      
      suggestions.forEach(s => {
        addShot(shot.sceneId, {
          title: s.title,
          characterIds: shot.characterIds,
          outfitIds: shot.outfitIds,
          locationId: shot.locationId,
          rawPrompt: s.prompt,
          optics: s.optics,
          motion: s.motion,
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
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
            <button
              onClick={async () => {
                if (!selectedShotId) return;
                setIsEnhancing(true);
                try {
                  await runAutomationForShot(selectedShotId);
                } finally {
                  setIsEnhancing(false);
                }
              }}
              disabled={isEnhancing || !state.apiKeys.google}
              className="text-[9px] mono text-accent hover:underline flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title={state.apiKeys.google ? "AI-enhance this prompt" : "Configure Google AI key to enable"}
            >
              {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
              {isEnhancing ? 'ENHANCING...' : 'ENHANCE'}
            </button>
          </div>
          <MentionTextarea 
            value={shot.rawPrompt}
            onChange={(v) => handleUpdate({ rawPrompt: v })}
            placeholder="Type @ to mention characters, outfits or locations..."
            rows={4}
          />
          
          {/* Automation Suggestion UI */}
          {promptSuggestion && (
            <div className="mt-2 p-3 bg-accent/5 border border-accent/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-accent">AI Suggestion</span>
                    <span className="text-[8px] mono text-zinc-500">
                      {Math.round(promptSuggestion.confidence * 100)}% confident
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-300 mb-2 line-clamp-2">
                    {promptSuggestion.reason}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleUpdate({ rawPrompt: promptSuggestion.suggested });
                        applySuggestion(promptSuggestion.id);
                      }}
                      className="text-[9px] px-2 py-1 bg-accent text-black font-bold rounded hover:bg-accent/90 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => dismissSuggestion(promptSuggestion.id)}
                      className="text-[9px] px-2 py-1 bg-ink-800 text-zinc-400 border border-line rounded hover:bg-white/10"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

          <div className="grid grid-cols-2 gap-3 mb-2">
             <div className="space-y-1">
               <label className="text-[8px] mono uppercase text-zinc-500 flex items-center gap-1">
                 <Timer size={8} /> Duration
               </label>
               <div className="flex items-center gap-2">
                 <input 
                   type="number" step="0.5"
                   value={shot.duration || 3.0}
                   onChange={(e) => handleUpdate({ duration: parseFloat(e.target.value) })}
                   className="nle-input text-[10px] py-1 w-16"
                 />
                 <span className="text-[8px] mono text-zinc-600">SEC</span>
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-[8px] mono uppercase text-zinc-500 flex items-center gap-1">
                 <Link2 size={8} /> Continuity
               </label>
                <button 
                  onClick={() => handleUpdate({ usePreviousFrameAsInit: !shot.usePreviousFrameAsInit })}
                  className={`w-full py-1 border rounded text-[8px] mono uppercase transition-all flex items-center justify-between gap-2 ${
                    shot.usePreviousFrameAsInit 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-ink-800 border-line text-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  <span>{shot.usePreviousFrameAsInit ? 'CHAIN: ON' : 'CHAIN: OFF'}</span>
                  {shot.usePreviousFrameAsInit && <Link2 size={10} />}
                </button>
             </div>
          </div>
          
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

        {/* Audio Stage */}
        <section className="space-y-3 pt-2">
          <h3 className="text-[9px] mono uppercase tracking-widest text-zinc-600 font-bold border-b border-line pb-1 flex items-center gap-1.5">
            <Volume2 size={10} /> Audio Stage
          </h3>
          <div className="space-y-3">
             <div className="space-y-1">
               <label className="text-[8px] mono uppercase text-zinc-500 flex items-center gap-1">
                 <Waves size={8} /> Ambient / Foley Prompt
               </label>
               <textarea 
                 value={shot.ambientSoundPrompt || ""}
                 onChange={(e) => handleUpdate({ ambientSoundPrompt: e.target.value })}
                 className="nle-input text-[10px] h-12 resize-none"
                 placeholder="e.g. Heavy rain on tin roof, distant thunder..."
               />
             </div>
             {shot.approvedTakeId && (
               <button 
                 onClick={() => handleGenerateAudio(shot.approvedTakeId!)}
                 className="w-full nle-button py-1.5 bg-ink-800 text-[9px] mono border-accent/20 text-accent hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
               >
                 <Sparkles size={10} /> GENERATE FOLEY FOR APPROVED TAKE
               </button>
             )}
          </div>

          <div className="h-[1px] bg-white/5 my-4" />

          <div className="space-y-3">
             <div className="space-y-1">
               <label className="text-[8px] mono uppercase text-zinc-500 flex items-center gap-1">
                 <User size={8} /> Character Dialogue
               </label>
               <div className="flex gap-2">
                 <select 
                   value={shot.speakingCharacterId || ""}
                   onChange={(e) => handleUpdate({ speakingCharacterId: e.target.value })}
                   className="nle-input text-[10px] py-1 w-1/3"
                 >
                   <option value="">No Speaker</option>
                   {shot.characterIds.map(cid => (
                     <option key={cid} value={cid}>{characters.find(c => c.id === cid)?.displayName}</option>
                   ))}
                 </select>
                 <textarea 
                   value={shot.dialogue || ""}
                   onChange={(e) => handleUpdate({ dialogue: e.target.value })}
                   className="nle-input text-[10px] h-12 flex-1 resize-none"
                   placeholder="Enter dialogue text..."
                 />
               </div>
             </div>
             {shot.approvedTakeId && shot.dialogue && (
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => {
                     const char = characters.find(c => c.id === shot.speakingCharacterId);
                     GenerationAPI.generateSpeech(shot.dialogue!, char?.voiceId || "default", state, (tid, updates) => updateTake(shot.id, tid, updates), shot.approvedTakeId!);
                   }}
                   className="nle-button py-1 text-[8px] mono flex items-center justify-center gap-1"
                 >
                   <Volume2 size={10} /> GENERATE SPEECH
                 </button>
                 <button 
                   onClick={() => {
                     const take = shot.takes.find(t => t.id === shot.approvedTakeId);
                     if (take?.speechUrl) {
                        GenerationAPI.generateLipSync(take, take.speechUrl, state, (tid, updates) => updateTake(shot.id, tid, updates));
                     } else {
                        alert("Generate speech audio first.");
                     }
                   }}
                   className="nle-button py-1 text-[8px] mono border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 flex items-center justify-center gap-1"
                 >
                   <Sparkles size={10} /> SYNC LIPS
                 </button>
               </div>
             )}
          </div>
        </section>

        {/* Continuity System */}
        <section className="pt-2">
          <ContinuityPanel shot={shot} />
        </section>

        {/* Entity Bindings */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-line pb-1">
            <h3 className="text-[9px] mono uppercase tracking-widest text-zinc-600 font-bold">Context Bindings</h3>
            <button
              onClick={handleSmartCoverage}
              disabled={isSuggesting}
              className="text-[9px] flex items-center gap-1 px-1.5 py-0.5 rounded border border-accent/30 text-accent hover:bg-accent/10 transition-colors mono disabled:opacity-50"
            >
              {isSuggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              SMART COVERAGE
            </button>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] text-zinc-400">
               <MapPin size={12} className="text-lime-500" />
               <span>Location:</span>
               <span className="text-white">{shot.locationId ? locations.find(l => l.id === shot.locationId)?.name : 'None Linked'}</span>
             </div>
             {shot.characterIds.map(cid => {
               const char = characters.find(c => c.id === cid);
               if (!char) return null;
               return (
                 <div key={cid} className="flex items-center gap-2 text-[10px] text-zinc-400">
                   <User size={12} className="text-cyan-500" />
                   <span>{char.displayName}:</span>
                   <span className="text-white">{shot.outfitIds[cid] ? char.outfits.find(o => o.id === shot.outfitIds[cid])?.name : 'Default'}</span>
                 </div>
               );
             })}
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

      <div className="p-4 border-t border-line bg-ink-850 shrink-0 space-y-3">
        {/* Generation Status Display */}
        {isRendering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] mono">
              <span className="text-accent animate-pulse">GENERATING TAKE...</span>
              <span className="text-zinc-400">{renderProgress || 0}%</span>
            </div>
            <div className="h-1.5 bg-ink-950 rounded-full overflow-hidden border border-line">
              <div 
                className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-300"
                style={{ width: `${renderProgress || 0}%` }}
              />
            </div>
          </div>
        )}

        {renderStatus === "failed" && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
            ✕ Generation failed. Check API key and try again.
          </div>
        )}

        {renderStatus === "completed" && (
          <div className="p-2 bg-lime-900/20 border border-lime-500/30 rounded text-xs text-lime-400 flex items-center gap-2">
            <CheckCircle2 size={12} /> Take rendered successfully
          </div>
        )}

        {/* Main Render Button */}
        <button 
          onClick={handleRender}
          disabled={isRendering}
          className={`w-full font-bold py-2.5 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isRendering
              ? 'bg-ink-800 text-zinc-500 border border-line cursor-not-allowed'
              : 'bg-accent text-black hover:bg-accent/90 shadow-[0_0_15px_rgba(255,107,61,0.2)] border border-accent/50'
          }`}
        >
          {isRendering ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              RENDERING...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              RENDER SELECTED SHOT
            </>
          )}
        </button>

        {!isRendering && renderStatus === "failed" && (
          <button 
            onClick={() => {
              // Clear failed takes and retry
              shot.takes.forEach(t => {
                if (t.status === "failed") {
                  updateTake(shot.id, t.id, { status: "queued" as const, error: undefined });
                }
              });
            }}
            className="w-full text-[10px] mono text-zinc-500 hover:text-accent underline"
          >
            Retry failed takes
          </button>
        )}
      </div>
    </div>
  );
}
