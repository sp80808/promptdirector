import React, { useState } from "react";
import { useStore } from "../../store";
import { Box, Plus, Trash2, Palette, Image as ImageIcon, Sparkles } from "lucide-react";

export function PropRoom() {
  const { props, addProp, updateProp } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(props[0]?.id || null);

  const selectedProp = props.find(p => p.id === selectedId);

  const handleCreateProp = () => {
    const id = addProp({
      name: "New Prop",
      description: "Describe the object...",
      referenceImages: [],
      color: "#38e1ff"
    });
    setSelectedId(id);
  };

  return (
    <div className="flex h-full bg-ink-950">
      {/* List Sidebar */}
      <div className="w-64 border-r border-line flex flex-col bg-ink-900">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Prop Room</h2>
          <button onClick={handleCreateProp} className="p-1 hover:bg-ink-800 rounded text-cyan-500">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {props.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${selectedId === p.id ? 'bg-ink-800 border border-line text-white' : 'text-zinc-500 hover:bg-ink-800/50'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs font-medium truncate">{p.name}</span>
            </button>
          ))}
          {props.length === 0 && (
            <div className="p-4 text-center opacity-20 mt-10">
              <Box size={32} className="mx-auto mb-2" />
              <p className="text-[10px] mono uppercase">No Props</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedProp ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <input 
                  value={selectedProp.name}
                  onChange={(e) => updateProp(selectedProp.id, { name: e.target.value })}
                  className="text-3xl font-bold bg-transparent border-none outline-none text-white w-full"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] mono text-cyan-500">@{selectedProp.name.replace(/\s+/g, "_")}</span>
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
              <h3 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold border-b border-line pb-2">Prop Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Object Description</label>
                  <textarea 
                    value={selectedProp.description}
                    onChange={(e) => updateProp(selectedProp.id, { description: e.target.value })}
                    className="nle-input h-24"
                    placeholder="Describe size, material, and unique visual features..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Reference Ingredients</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-ink-900 border-2 border-dashed border-line rounded flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                      <ImageIcon className="text-zinc-700" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Box size={48} className="mb-4 text-cyan-500" />
            <p className="mono text-xs uppercase tracking-widest text-zinc-500">Inventory and tag cinematic props</p>
            <button onClick={handleCreateProp} className="mt-6 nle-button py-2 px-6 border-cyan-500/20 text-cyan-500 hover:bg-cyan-500/10">
               + ADD NEW PROP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
