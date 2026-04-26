import React, { useState, useMemo } from "react";
import { useStore } from "../../store";
import { X, Download, Wand2, Crop, Maximize2, Sparkles, Loader2, Play, Code2, Info } from "lucide-react";
import { GenerationAPI } from "../../utils/api";
import { InpaintModal } from "./InpaintModal";

export function MediaViewer({ shotId, takeId }: { shotId: string, takeId: string }) {
  const state = useStore();
  const { shots, setModal, updateTake } = state;
  const shot = shots[shotId];
  const take = shot?.takes.find(t => t.id === takeId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showInpaint, setShowInpaint] = useState(false);
  const [activeTab, setActiveTab] = useState<'meta' | 'workflow'>('meta');

  const workflowJson = useMemo(() => {
    if (!take?.metadata) return null;
    return {
      "3": { "class_type": "KSampler", "inputs": { "seed": take.seed, "steps": take.metadata.steps, "cfg": take.metadata.cfgScale, "denoise": 1, "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0] } },
      "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": take.metadata.model } },
      "5": { "class_type": "EmptyLatentImage", "inputs": { "width": 1024, "height": 576, "batch_size": 1 } },
      "6": { "class_type": "CLIPTextEncode", "inputs": { "text": take.metadata.prompt, "clip": ["4", 1] } },
      "7": { "class_type": "CLIPTextEncode", "inputs": { "text": take.metadata.negativePrompt || "", "clip": ["4", 1] } },
      "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
      "9": { "class_type": "SaveImage", "inputs": { "filename_prefix": "CinematicAI", "images": ["8", 0] } }
    };
  }, [take]);

  if (!take) return null;

  const handleDownload = () => {
    if (!take.fullImageUrl && !take.videoUrl) return;
    const link = document.createElement('a');
    link.href = take.videoUrl || take.fullImageUrl!;
    link.download = `take_${take.id}.${take.videoUrl ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpscale = async () => {
    setIsProcessing(true);
    await GenerationAPI.upscaleTake(take, state, (id, updates) => {
      updateTake(shotId, id, updates);
    });
    setIsProcessing(false);
  };

  const handleAnimate = async () => {
    setIsProcessing(true);
    await GenerationAPI.animateTake(take, state, (id, updates) => {
      updateTake(shotId, id, updates);
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-ink-950/95 backdrop-blur-md z-[100] flex flex-col">
      <div className="h-14 border-b border-line flex items-center justify-between px-6 bg-ink-900/50 shrink-0">
        <div className="flex items-center gap-4">
           <h2 className="text-sm font-bold text-white">Take Viewer</h2>
           <span className="text-[10px] mono text-accent px-2 py-0.5 rounded bg-accent/10 uppercase tracking-widest">{take.metadata?.model || 'Unknown Model'}</span>
           <span className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Seed: {take.seed}</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleDownload} className="nle-button flex items-center gap-2">
              <Download size={14} /> Download
           </button>
           <button onClick={() => setModal(null)} className="p-2 hover:bg-ink-800 rounded text-zinc-400 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 flex items-center justify-center p-8 relative">
           <div className="max-w-full max-h-full relative group flex items-center justify-center">
             {isProcessing || take.status === 'rendering' ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-accent" size={48} />
                  <p className="mono text-xs uppercase tracking-widest text-zinc-500 animate-pulse">Processing...</p>
                </div>
             ) : take.videoUrl ? (
               <video src={take.videoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded shadow-2xl" />
             ) : take.fullImageUrl ? (
               <img src={take.fullImageUrl} alt="Take" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
             ) : (
               <div className="w-96 h-64 bg-ink-900 border border-line rounded flex items-center justify-center">
                 <span className="mono text-xs text-zinc-600">No Media Available</span>
               </div>
             )}
             
             {!isProcessing && take.status !== 'rendering' && !take.videoUrl && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-ink-900/90 backdrop-blur border border-line p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                 <button onClick={handleUpscale} className="nle-button flex items-center gap-2 bg-ink-850 hover:bg-accent/20 hover:text-accent hover:border-accent border-line text-zinc-300">
                   <Maximize2 size={14} /> Upscale
                 </button>
                 <button onClick={() => setShowInpaint(true)} className="nle-button flex items-center gap-2 bg-ink-850 hover:bg-lime-500/20 hover:text-lime-500 hover:border-lime-500 border-line text-zinc-300">
                   <Crop size={14} /> Inpaint
                 </button>
                 <button onClick={handleAnimate} className="nle-button flex items-center gap-2 bg-ink-850 hover:bg-cyan-500/20 hover:text-cyan-500 hover:border-cyan-500 border-line text-zinc-300">
                   <Sparkles size={14} /> Animate
                 </button>
               </div>
             )}
           </div>
         </div>

         <div className="w-80 border-l border-line bg-ink-900 flex flex-col shrink-0">
           <div className="flex border-b border-line">
              <button 
                onClick={() => setActiveTab('meta')}
                className={`flex-1 py-3 text-[9px] mono uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'meta' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Info size={12} /> INFO
              </button>
              <button 
                onClick={() => setActiveTab('workflow')}
                className={`flex-1 py-3 text-[9px] mono uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'workflow' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Code2 size={12} /> WORKFLOW
              </button>
           </div>

           <div className="flex-1 overflow-y-auto">
             {activeTab === 'meta' ? (
               take.metadata ? (
                 <div className="p-4 space-y-6">
                   <div className="space-y-2">
                     <label className="text-[9px] mono uppercase text-zinc-500 font-bold flex items-center gap-1"><Wand2 size={10} className="text-accent" /> Compiled Prompt</label>
                     <div className="bg-ink-950 border border-line rounded p-3 text-[11px] text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto mono">
                       {take.metadata.prompt}
                     </div>
                   </div>
                   {take.metadata.negativePrompt && (
                     <div className="space-y-2">
                       <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Negative Prompt</label>
                       <div className="bg-ink-950 border border-line rounded p-2 text-[10px] text-red-400/80 mono">
                         {take.metadata.negativePrompt}
                       </div>
                     </div>
                   )}
                   <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                     <div>
                       <label className="text-[9px] mono uppercase text-zinc-500 font-bold">CFG Scale</label>
                       <p className="text-sm font-bold text-white mt-1">{take.metadata.cfgScale}</p>
                     </div>
                     <div>
                       <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Steps</label>
                       <p className="text-sm font-bold text-white mt-1">{take.metadata.steps}</p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="p-4 text-center text-zinc-600 mono text-[10px] mt-10">No metadata available</div>
               )
             ) : (
               <div className="p-4 space-y-4">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] mono text-cyan-400 font-bold">COMFYUI API JSON</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2))}
                      className="text-[8px] mono text-zinc-500 hover:text-white"
                    >
                      COPY
                    </button>
                 </div>
                 <pre className="bg-ink-950 border border-line rounded p-4 text-[9px] text-cyan-400/80 overflow-x-auto mono max-h-[500px]">
                   {JSON.stringify(workflowJson, null, 2)}
                 </pre>
               </div>
             )}
           </div>
         </div>
      </div>

      {showInpaint && (
        <InpaintModal 
          shotId={shotId} 
          takeId={takeId} 
          onClose={() => setShowInpaint(false)} 
        />
      )}
    </div>
  );
}
