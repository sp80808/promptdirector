import { useStore } from "../../store";
import { downloadOTIO } from "../../utils/export";
import { IconDownload, IconClose } from "../shared/Icons";

export function ExportModal() {
  const { scenes, shots, setModal } = useStore();

  const handleExport = () => {
    downloadOTIO(scenes, shots);
    setModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Export Sequence</h2>
            <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Post-Production Handover</p>
          </div>
          <button onClick={() => setModal(null)} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">OpenTimelineIO (.otio)</span>
              <span className="text-[9px] mono px-1.5 py-0.5 bg-accent/20 text-accent rounded">PRO</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Standard interchange format for DaVinci Resolve, Premiere Pro, and Final Cut Pro. Includes all shot metadata and media references.
            </p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="w-full nle-button py-3 bg-accent text-black font-bold border-none flex items-center justify-center gap-2"
        >
          <IconDownload size={16} /> DOWNLOAD SEQUENCE
        </button>
      </div>
    </div>
  );
}
