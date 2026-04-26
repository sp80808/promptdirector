import { useStore } from "../../store";
import { Character, Outfit } from "../../types";
import { User, Plus, Sparkles, Trash2, Palette, Image as ImageIcon } from "lucide-react";

export function CharacterForge() {
  const { characters, addCharacter, updateCharacter, addOutfit } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(characters[0]?.id || null);

  const selectedChar = characters.find(c => c.id === selectedId);

  const handleCreateMaster = () => {
    const id = addCharacter({
      name: "NewChar",
      displayName: "New Character",
      traits: "Stoic, 30s",
      seed: Math.floor(Math.random() * 1000000),
      color: "#ff6b3d",
      masterReferenceImages: [],
      outfits: []
    });
    setSelectedId(id);
  };

  return (
    <div className="flex h-full bg-ink-950">
      {/* List Sidebar */}
      <div className="w-64 border-r border-line flex flex-col bg-ink-900">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Characters</h2>
          <button onClick={handleCreateMaster} className="p-1 hover:bg-ink-800 rounded text-accent">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {characters.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${selectedId === c.id ? 'bg-ink-800 border border-line text-white' : 'text-zinc-500 hover:bg-ink-800/50'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-medium truncate">{c.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Main */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedChar ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <input 
                  value={selectedChar.displayName}
                  onChange={(e) => updateCharacter(selectedChar.id, { displayName: e.target.value })}
                  className="text-3xl font-bold bg-transparent border-none outline-none text-white w-full"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] mono text-accent">@{selectedChar.name}</span>
                  <div className="h-3 w-[1px] bg-line" />
                  <span className="text-[10px] mono text-zinc-500">SEED: {selectedChar.seed}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="nle-button flex items-center gap-2">
                  <Palette size={14} /> Color
                </button>
                <button className="nle-button text-red-400 border-red-400/20 hover:bg-red-400/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <section className="space-y-4">
              <h3 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold border-b border-line pb-2">Master Identity</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Physical Traits & LoRA</label>
                    <textarea 
                      value={selectedChar.traits}
                      onChange={(e) => updateCharacter(selectedChar.id, { traits: e.target.value })}
                      className="nle-input h-24"
                      placeholder="Describe age, ethnicity, hair, eyes..."
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] mono text-zinc-500 uppercase">Base LoRA:</span>
                      <input 
                        value={selectedChar.baseLoRA || ""}
                        onChange={(e) => updateCharacter(selectedChar.id, { baseLoRA: e.target.value })}
                        className="nle-input text-[10px] py-1 flex-1"
                        placeholder="huggingface-id/lora-name"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold">Visual Anchors (Reference Images)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedChar.masterReferenceImages.map(img => (
                      <div key={img.id} className="aspect-square bg-ink-800 rounded border border-line overflow-hidden group relative">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-square bg-ink-900 border-2 border-dashed border-line rounded flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors text-zinc-700 hover:text-accent">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Outfit Variants</h3>
                <button 
                  onClick={() => addOutfit(selectedChar.id, { name: "New Outfit", clothingDesc: "Describe clothing...", referenceImages: [] })}
                  className="text-[10px] mono text-accent flex items-center gap-1 hover:underline"
                >
                  <Plus size={10} /> ADD OUTFIT
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {selectedChar.outfits.map(o => (
                  <div key={o.id} className="nle-panel p-4 flex gap-4 bg-ink-900/50">
                    <div className="w-32 h-32 bg-ink-950 border border-line rounded flex items-center justify-center shrink-0">
                      <Sparkles className="text-zinc-800" size={32} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <input 
                          value={o.name}
                          className="bg-transparent border-none outline-none font-bold text-sm text-white w-full"
                        />
                        <button className="text-zinc-600 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea 
                        value={o.clothingDesc}
                        className="nle-input h-16 bg-ink-900"
                        placeholder="Clothing description..."
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] mono text-zinc-600 uppercase">Tags:</span>
                        <span className="text-[10px] mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">@{selectedChar.name}_{o.name.replace(/\s+/g, "_")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <User size={48} className="mb-4" />
            <p className="mono text-xs uppercase tracking-widest">Select a character to edit their bible</p>
          </div>
        )}
      </div>
    </div>
  );
}
