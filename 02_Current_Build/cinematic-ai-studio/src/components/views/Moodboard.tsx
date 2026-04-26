import { useState } from "react";
import { useStore } from "../../store";
import { IconSparkle, IconImage } from "../shared/Icons";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function Moodboard() {
  const { apiKeys } = useStore();
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [moods, setMoods] = useState<{ id: string, url: string, prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!apiKeys.google) {
      alert("Please configure Google AI Studio Key for Imagen 3 support.");
      return;
    }
    setIsGenerating(true);
    // Mocking the generation for now to show UI
    setTimeout(() => {
      const id = Math.random().toString(36).slice(2, 9);
      setMoods(prev => [{
        id,
        url: `https://picsum.photos/seed/${id}/1280/720`,
        prompt: imagePrompt
      }, ...prev]);
      setIsGenerating(false);
      setImagePrompt("");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-ink-950 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-ink-900">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Visual Concept Engine
          </h2>
          <p className="text-[10px] mono text-zinc-500 uppercase tracking-widest">Generate moodboards & visual DNA</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-white/5 p-6 space-y-6 overflow-y-auto bg-ink-900/50">
          <div className="space-y-2">
            <label className="text-[9px] mono uppercase font-bold text-zinc-500 tracking-wider">Mood Prompt</label>
            <textarea 
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="nle-input h-32 resize-none text-[11px]"
              placeholder="Describe the visual essence, lighting, and textures..."
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !imagePrompt}
            className="w-full bg-orange-600 text-black text-[10px] py-3 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-orange-500 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <IconSparkle size={14} />}
            {isGenerating ? "Synthesizing..." : "Generate Concept"}
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 p-8 overflow-y-auto bg-ink-950">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
            {moods.map(mood => (
              <div key={mood.id} className="group relative nle-panel p-0 overflow-hidden aspect-video bg-black flex flex-col">
                <img src={mood.url} alt={mood.prompt} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-[10px] text-white line-clamp-2 mb-3">{mood.prompt}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 nle-button py-1 text-[9px] border-white/20 hover:border-accent hover:text-accent">
                      USE AS REFERENCE
                    </button>
                    <button 
                      onClick={() => setMoods(prev => prev.filter(m => m.id !== mood.id))}
                      className="p-2 nle-button border-white/20 hover:border-red-500/50 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {moods.length === 0 && !isGenerating && (
              <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-20">
                <IconImage size={64} className="mb-4" />
                <p className="mono text-xs uppercase tracking-widest text-zinc-500 font-bold italic">Gallery Empty</p>
                <p className="mono text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Generate concepts to build your visual bible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
