import { useStore } from "../../store";
import { downloadOTIO, downloadProductionBible, saveProjectFile } from "../../utils/export";
import { IconDownload, IconClose } from "../shared/Icons";
import { BookOpen, Save } from "lucide-react";

export function ExportModal() {
  const state = useStore();
  const { scenes, shots, characters, locations, props, setModal } = state;

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Export Project</h2>
            <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Select Output Format</p>
          </div>
          <button onClick={() => setModal(null)} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2 group hover:border-accent/30 transition-all cursor-pointer" onClick={handleSaveProject}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Save size={14} className="text-cyan-400" /> Save Project (.cai)
              </span>
              <span className="text-[9px] mono px-1.5 py-0.5 bg-cyan-400/20 text-cyan-400 rounded">FULL STATE</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Downloads your complete project, including characters, locations, scenes, and all AI-generated takes, so you can resume editing later.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2 group hover:border-accent/30 transition-all cursor-pointer" onClick={handleExportBible}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <BookOpen size={14} className="text-accent" /> Production Bible (.md)
              </span>
              <span className="text-[9px] mono px-1.5 py-0.5 bg-lime-500/20 text-lime-500 rounded">FREE</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Complete project documentation including character bibles, location profiles, and full shot breakdowns. Perfect for pitch decks.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2 group hover:border-accent/30 transition-all cursor-pointer" onClick={handleExportOTIO}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">OpenTimelineIO (.otio)</span>
              <span className="text-[9px] mono px-1.5 py-0.5 bg-accent/20 text-accent rounded">PRO</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Standard interchange format for DaVinci Resolve and Premiere Pro. Includes all shot metadata and media references.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button 
            onClick={handleExportBible}
            className="w-full nle-button py-3 bg-white/5 hover:bg-white/10 text-white font-bold border-line flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen size={16} /> GENERATE PRODUCTION BIBLE
          </button>
          <button 
            onClick={handleExportOTIO}
            className="w-full nle-button py-3 bg-accent text-black font-bold border-none flex items-center justify-center gap-2"
          >
            <IconDownload size={16} /> DOWNLOAD SEQUENCE (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
