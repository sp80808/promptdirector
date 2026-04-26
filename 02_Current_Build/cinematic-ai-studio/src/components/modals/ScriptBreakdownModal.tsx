import { useState } from "react";
import { useStore } from "../../store";
import { autoBreakdownScript } from "../../services/ai";
import { 
  IconSparkle, 
  IconClose, 
  IconSlate 
} from "../shared/Icons";
import { Loader2 } from "lucide-react";

export function ScriptBreakdownModal() {
  const { apiKeys, addSceneFromScript, setModal } = useStore();
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("New Sequence");

  const handleBreakdown = async () => {
    const apiKey = apiKeys.google;
    if (!apiKey) {
      alert("Please configure your Google AI Studio API key in Settings.");
      return;
    }
    if (!script.trim()) return;

    setIsLoading(true);
    try {
      const shots = await autoBreakdownScript(apiKey, script);
      addSceneFromScript(title, shots);
      setScript("");
      setTitle("New Sequence");
      setModal(null);
    } catch (e: any) {
      alert("Failed to breakdown script: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <IconSparkle className="w-5 h-5 text-orange-500" />
            <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-400 font-bold">Auto-Storyboard Engine</h2>
          </div>
          <button onClick={() => setModal(null)} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] mono uppercase font-bold text-zinc-500 tracking-wider">Sequence Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="nle-input font-bold"
              placeholder="e.g. Scene 4: The Showdown"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] mono uppercase font-bold text-zinc-500 flex items-center gap-1.5 tracking-wider">
              <IconSlate className="w-3 h-3" /> Paste Script
            </label>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="nle-input h-[300px] leading-relaxed resize-none font-mono text-[11px] placeholder:italic" 
              placeholder="INT. LAIR - NIGHT&#10;&#10;The hero steps from the shadows. Lighting reveals a weathered face..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end">
          <button 
            onClick={handleBreakdown}
            disabled={isLoading}
            className="bg-orange-600 text-black text-[10px] px-6 py-2.5 rounded font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IconSparkle className="w-4 h-4" />}
            {isLoading ? 'Parsing Shots...' : 'Generate Breakdown'}
          </button>
        </div>

      </div>
    </div>
  );
}
