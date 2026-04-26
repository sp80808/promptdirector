import { useStore } from "../../store";
import { downloadOTIO, downloadProductionBible, saveProjectFile } from "../../utils/export";
import { VideoProcessor } from "../../utils/video/processor";
import { IconDownload, IconClose } from "../shared/Icons";
import { BookOpen, Save, Film, Loader2 } from "lucide-react";
import { useState } from "react";

export function ExportModal() {
  const state = useStore();
  const { scenes, shots, characters, locations, props, setModal } = state;
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const handleExportOTIO = () => {
    downloadOTIO(scenes, shots);
    setModal(null);
  };

  const handleExportBible = () => {
    downloadProductionBible({ characters, locations, scenes, shots });
    setModal(null);
  };

  const handleSaveProject = () => {
    saveProjectFile({ characters, locations, scenes, shots, props });
    setModal(null);
  };

  const handleRenderMaster = async () => {
    setIsRendering(true);
    try {
      const items: { url: string, isVideo: boolean, duration: number }[] = [];
      scenes.forEach(scene => {
        scene.shotIds.forEach(shotId => {
          const shot = shots[shotId];
          if (shot && shot.approvedTakeId) {
            const take = shot.takes.find(t => t.id === shot.approvedTakeId);
            if (take) {
              items.push({
                url: take.videoUrl || take.fullImageUrl || "",
                isVideo: !!take.videoUrl,
                duration: shot.duration || 3.0
              });
            }
          }
        });
      });

      if (items.length === 0) {
        alert("No approved takes found to render.");
        setIsRendering(false);
        return;
      }

      const blob = await VideoProcessor.stitchSequence(items, p => setRenderProgress(p));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Master_Cut_${Date.now()}.mp4`;
      a.click();
      setModal(null);
    } catch (e) {
      console.error(e);
      alert("Render failed. Check console for details.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Export & Mastering</h2>
            <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Client-Side FOSS Pipeline</p>
          </div>
          <button onClick={() => setModal(null)} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {isRendering ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
             <Loader2 className="animate-spin text-accent" size={48} />
             <div className="text-center space-y-2">
                <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Compiling Master Cut...</p>
                <p className="text-[10px] mono text-zinc-500">Stitching takes using FFmpeg.wasm</p>
             </div>
             <div className="w-full h-1 bg-ink-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${renderProgress}%` }} />
             </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="p-4 bg-lime-500/5 border border-lime-500/10 rounded-lg space-y-2 group hover:border-lime-500/30 transition-all cursor-pointer" onClick={handleRenderMaster}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Film size={14} className="text-lime-400" /> Render Master (.mp4)
                  </span>
                  <span className="text-[9px] mono px-1.5 py-0.5 bg-lime-400/20 text-lime-400 rounded">LOCAL FOSS</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Stitches all approved takes into a single high-quality MP4 file. Runs locally in your browser using FFmpeg.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2 group hover:border-accent/30 transition-all cursor-pointer" onClick={handleSaveProject}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Save size={14} className="text-cyan-400" /> Save Project (.cai)
                  </span>
                  <span className="text-[9px] mono px-1.5 py-0.5 bg-cyan-400/20 text-cyan-400 rounded">FULL STATE</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Downloads your complete project database for future editing.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2 group hover:border-accent/30 transition-all cursor-pointer" onClick={handleExportOTIO}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">OpenTimelineIO (.otio)</span>
                  <span className="text-[9px] mono px-1.5 py-0.5 bg-accent/20 text-accent rounded">PRO</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Standard format for Resolve/Premiere post-production.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={handleRenderMaster}
                className="w-full nle-button py-3 bg-lime-600 text-black font-bold border-none flex items-center justify-center gap-2 hover:bg-lime-500"
              >
                <Film size={16} /> COMPILE MASTER VIDEO
              </button>
              <button 
                onClick={handleExportBible}
                className="w-full nle-button py-3 bg-white/5 hover:bg-white/10 text-white font-bold border-line flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen size={16} /> PRODUCTION BIBLE (.MD)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
