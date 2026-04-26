import { Image as ImageIcon, Loader2, Sparkles, SwitchCamera } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';
import { generateMoodboardImage, adaptToSceneDescription } from '../services/api';

export function Moodboard() {
  const { googleAiKey } = useStore();
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [contextNotes, setContextNotes] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);

  const handleGenerateImage = async () => {
    if (!googleAiKey) {
      alert("Please configure your Google AI Studio API key in Settings (BYOK).");
      return;
    }
    if (!imagePrompt) return;
    
    setIsGeneratingImage(true);
    try {
      const imgData = await generateMoodboardImage(googleAiKey, imagePrompt);
      setGeneratedImage(imgData);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAdaptScene = async () => {
    if (!googleAiKey) {
      alert("Please configure your Google AI Studio API key in Settings (BYOK).");
      return;
    }
    if (!generatedImage) return;

    setIsAdapting(true);
    try {
      const description = await adaptToSceneDescription(googleAiKey, generatedImage, contextNotes);
      setSceneDescription(description);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[#121212] border border-[#222] rounded-lg p-5 shrink-0">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 italic underline underline-offset-4 mb-1">Visual Concept Engine</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Generate Moodboards & Contextualize Scenes</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
        {/* Left: Image Generation */}
        <div className="bg-[#121212] border border-[#222] rounded-lg p-5 flex flex-col overflow-y-auto">
          <h3 className="text-[10px] uppercase font-bold text-orange-500 tracking-widest mb-4 flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Step 1: Mood Generation
          </h3>
          
          <div className="mb-4">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-1.5 block">Visual Prompt</label>
            <textarea 
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="A brutalist concrete megastructure lit by harsh sodium lamps at night, cinematic lighting, 35mm lens..."
              className="w-full h-24 bg-black border border-[#333] rounded px-3 py-2 text-xs outline-none focus:border-orange-500 text-slate-300 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          <button 
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !imagePrompt}
            className="w-full bg-orange-600/10 border border-orange-600/50 text-orange-500 hover:bg-orange-600 hover:text-white rounded text-[10px] py-2 font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
            {isGeneratingImage ? 'Synthesizing Visual...' : 'Generate Image'}
          </button>

          <div className="mt-4 flex-1 border-2 border-dashed border-[#333] bg-black/30 rounded flex items-center justify-center overflow-hidden min-h-[250px]">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated Moodboard" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-6 h-6 text-[#333] mx-auto mb-2" />
                <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest leading-relaxed block">Awaiting<br/>Imagination</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Contextual Adaptation */}
        <div className="bg-[#121212] border border-[#222] rounded-lg p-5 flex flex-col overflow-y-auto">
          <h3 className="text-[10px] uppercase font-bold text-[#10b981] tracking-widest mb-4 flex items-center gap-2">
            <SwitchCamera className="w-3 h-3" /> Step 2: Scene Adaptation
          </h3>

          <div className="mb-4">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-1.5 block">Director's Context Notes (Optional)</label>
            <textarea 
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="e.g. Elias is walking through this area feeling defeated. Focus on the oppressive scale of the environment."
              className="w-full h-24 bg-black border border-[#333] rounded px-3 py-2 text-xs outline-none focus:border-[#10b981] text-slate-300 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          <button 
            onClick={handleAdaptScene}
            disabled={isAdapting || !generatedImage}
            className="w-full bg-[#10b981]/10 border border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981] hover:text-white rounded text-[10px] py-2 font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isAdapting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
            {isAdapting ? 'Adapting Scene...' : 'Write Scene Description'}
          </button>

          <div className="mt-4 flex-1 bg-black/40 border border-[#222] p-4 rounded overflow-y-auto min-h-[250px]">
             {sceneDescription ? (
                <div className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {sceneDescription}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center pb-8">
                   <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest leading-relaxed">
                     Require Image Reference<br/>To Draft Scene
                   </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
