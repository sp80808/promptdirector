import { useState } from 'react';
import { useStore } from '../store';
import { Sparkles, FileText, X, Loader2 } from 'lucide-react';
import { autoBreakdownScript } from '../services/api';

export function ScriptBreakdownModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { googleAiKey, addSceneFromScript } = useStore();
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('New Sequence');

  if (!isOpen) return null;

  const handleBreakdown = async () => {
    if (!googleAiKey) {
      alert("Please configure your Google AI Studio API key in Settings (BYOK).");
      return;
    }
    if (!script.trim()) return;

    setIsLoading(true);
    /* eCoT:
     * 1. Send the script body and title to Gemini.
     * 2. Gemini returns an array of shots (description, angle, etc).
     * 3. Send parsed array to Zustand store to construct a new SceneBlock and Shot records.
     * 4. Close modal and await visual updates.
     */
    try {
      const shots = await autoBreakdownScript(googleAiKey, script);
      addSceneFromScript(title, shots);
      setScript('');
      setTitle('New Sequence');
      onClose();
    } catch (e: any) {
      alert("Failed to breakdown script: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-[#222]">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold uppercase tracking-wider text-[11px]">Auto-Storyboard Engine</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sequence Title</label>
            <input 
              className="w-full bg-[#1A1A1A] border border-[#333] p-2 rounded text-slate-300 text-[11px] focus:border-orange-500 outline-none" 
              placeholder="e.g. Scene 4: The Showdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3" /> Paste Script
            </label>
            <textarea 
              className="w-full bg-[#1A1A1A] border border-[#333] p-3 rounded text-slate-300 text-[11px] min-h-[300px] leading-relaxed focus:border-orange-500 outline-none resize-none font-mono placeholder:italic" 
              placeholder="INT. LAIR - NIGHT&#10;&#10;The hero steps from the shadows. Lighting reveals a weathered face..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#222] flex justify-end">
          <button 
            onClick={handleBreakdown}
            disabled={isLoading}
            className="bg-orange-600 text-white text-[10px] px-5 py-2.5 rounded font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Parsing Shots...' : 'Generate Breakdown'}
          </button>
        </div>

      </div>
    </div>
  );
}
