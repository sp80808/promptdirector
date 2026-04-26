import { Key, X } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, googleAiKey, nanoBananaKey, seedanceKey, setKeys } = useStore();
  
  // Local state for editing before saving
  const [localGoogle, setLocalGoogle] = useState(googleAiKey);
  const [localNano, setLocalNano] = useState(nanoBananaKey);
  const [localSeedance, setLocalSeedance] = useState(seedanceKey);

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalGoogle(googleAiKey);
      setLocalNano(nanoBananaKey);
      setLocalSeedance(seedanceKey);
    }
  }, [isSettingsOpen, googleAiKey, nanoBananaKey, seedanceKey]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setKeys({
      googleAiKey: localGoogle,
      nanoBananaKey: localNano,
      seedanceKey: localSeedance,
    });
    setSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#121212] border border-[#222] rounded-lg shadow-2xl overflow-hidden flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-white">BYOK Setup</h2>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
            Configure your local connection. Keys are securely stored in your browser's local storage.
          </p>

          <div className="space-y-4">
            {/* Google AI Studio / Gemini */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-2">
                Google AI Studio API
              </label>
              <input 
                type="password"
                value={localGoogle}
                onChange={(e) => setLocalGoogle(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-[#333] rounded px-3 py-2 text-xs focus:border-orange-500 outline-none text-slate-300 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Nano Banana */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-2">
                Nano Banana Key
              </label>
              <input 
                type="password"
                value={localNano}
                onChange={(e) => setLocalNano(e.target.value)}
                placeholder="nb_..."
                className="w-full bg-black border border-[#333] rounded px-3 py-2 text-xs focus:border-orange-500 outline-none text-slate-300 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Seedance 2.0 */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-2">
                Seedance 2.0 Token
              </label>
              <input 
                type="password"
                value={localSeedance}
                onChange={(e) => setLocalSeedance(e.target.value)}
                placeholder="sd_..."
                className="w-full bg-black border border-[#333] rounded px-3 py-2 text-xs focus:border-orange-500 outline-none text-slate-300 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#222]">
          <button 
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-orange-600/10 border border-orange-600/50 text-orange-500 hover:bg-orange-600 hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Save Config
          </button>
        </div>
      </div>
    </div>
  );
}
