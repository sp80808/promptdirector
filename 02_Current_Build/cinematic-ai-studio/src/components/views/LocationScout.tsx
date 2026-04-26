import React, { useState } from "react";
import { useStore } from "../../store";
import { MapPin, Plus, Trash2, Palette, Image as ImageIcon, Sun, Moon, CloudSun, Sunrise } from "lucide-react";

export function LocationScout() {
  const { locations, addLocation, updateLocation } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(locations[0]?.id || null);

  const selectedLoc = locations.find(l => l.id === selectedId);

  const handleCreateLocation = () => {
    const id = addLocation({
      name: "New Location",
      description: "Describe the environment...",
      timeOfDay: "Day",
      lightingMood: "Natural light, soft shadows",
      referenceImages: [],
      color: "#b6ff5c"
    });
    setSelectedId(id);
  };

  return (
    <div className="flex h-full bg-ink-950">
      {/* List Sidebar */}
      <div className="w-64 border-r border-line flex flex-col bg-ink-900">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold">Location Scout</h2>
          <button onClick={handleCreateLocation} className="p-1 hover:bg-ink-800 rounded text-lime-500">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {locations.map(l => (
            <button
              key={l.id}
              onClick={() => setSelectedId(l.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${selectedId === l.id ? 'bg-ink-800 border border-line text-white' : 'text-zinc-500 hover:bg-ink-800/50'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs font-medium truncate">{l.name}</span>
            </button>
          ))}
          {locations.length === 0 && (
            <div className="p-4 text-center opacity-20 mt-10">
              <MapPin size={32} className="mx-auto mb-2" />
              <p className="text-[10px] mono uppercase">No Locations</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedLoc ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <input 
                  value={selectedLoc.name}
                  onChange={(e) => updateLocation(selectedLoc.id, { name: e.target.value })}
                  className="text-3xl font-bold bg-transparent border-none outline-none text-white w-full"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] mono text-lime-500">@{selectedLoc.name.replace(/\s+/g, "_")}</span>
                  <div className="h-3 w-[1px] bg-line" />
                  <span className="text-[10px] mono text-zinc-500 uppercase tracking-widest">{selectedLoc.timeOfDay}</span>
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
              <h3 className="text-[10px] mono uppercase tracking-widest text-zinc-500 font-bold border-b border-line pb-2">Environment Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Description</label>
                    <textarea 
                      value={selectedLoc.description}
                      onChange={(e) => updateLocation(selectedLoc.id, { description: e.target.value })}
                      className="nle-input h-24"
                      placeholder="Describe the architectural and environmental details..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Lighting Mood</label>
                    <input 
                      value={selectedLoc.lightingMood}
                      onChange={(e) => updateLocation(selectedLoc.id, { lightingMood: e.target.value })}
                      className="nle-input"
                      placeholder="e.g. Golden hour, cinematic teal/orange..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Time of Day</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Dawn', 'Day', 'Dusk', 'Night'].map(tod => (
                        <button
                          key={tod}
                          onClick={() => updateLocation(selectedLoc.id, { timeOfDay: tod })}
                          className={`flex items-center gap-2 px-3 py-2 rounded border text-[10px] font-bold uppercase transition-all ${selectedLoc.timeOfDay === tod ? 'bg-lime-500/10 border-lime-500 text-lime-500' : 'bg-ink-800 border-line text-zinc-500 hover:border-zinc-500'}`}
                        >
                          {tod === 'Dawn' && <Sunrise size={12} />}
                          {tod === 'Day' && <Sun size={12} />}
                          {tod === 'Dusk' && <CloudSun size={12} />}
                          {tod === 'Night' && <Moon size={12} />}
                          {tod}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] mono uppercase text-zinc-500 font-bold">Visual References</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-ink-900 border-2 border-dashed border-line rounded flex items-center justify-center cursor-pointer hover:border-lime-500/50 transition-colors">
                        <ImageIcon className="text-zinc-700" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <MapPin size={48} className="mb-4 text-lime-500" />
            <p className="mono text-xs uppercase tracking-widest text-zinc-500">Select a location to define its cinematic mood</p>
            <button onClick={handleCreateLocation} className="mt-6 nle-button py-2 px-6 border-lime-500/20 text-lime-500 hover:bg-lime-500/10">
               + SCOUT NEW LOCATION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
