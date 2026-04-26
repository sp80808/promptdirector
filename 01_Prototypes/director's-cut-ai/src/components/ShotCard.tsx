import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore } from '../store';
import { SmartPromptInput } from './SmartPromptInput';
import { Copy, ImagePlus, Play, Sparkles, Link as LinkIcon, Loader2, AlertTriangle, Lock, Unlock, Film } from 'lucide-react';
import { useState } from 'react';
import { checkContinuity, enhancePromptText } from '../services/api';

export const ShotCard: React.FC<{ shotId: string; index: number; nextShotId?: string }> = ({ shotId, index, nextShotId }) => {
  const { shots, soulIds, googleAiKey, setContinuityErrors, toggleFaceLock, chainShot, addToBRoll, environments, setEnhancedPrompt, queueTask, updateShotVideo } = useStore();
  const shot = shots[shotId];
  const nextShot = nextShotId ? shots[nextShotId] : null;

  const [isChecking, setIsChecking] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [visualStyle, setVisualStyle] = useState('Noir/Chiaroscuro');

  if (!shot) return null;

  const handleRender = async () => {
    setIsRendering(true);
    try {
      /* eCoT: 
       * 1. Simulate video generation delay.
       * 2. Set the mock video URL on completion.
       * 3. If lockFace is enabled, queue a dependent Face Lock task immediately.
       */
      await new Promise(r => setTimeout(r, 2000));
      
      const mockVideoUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4#t=${index * 5}`;
      updateShotVideo(shot.id, mockVideoUrl);

      if (shot.lockFace) {
        const variantSeg = shot.structuredPrompt.find(s => s.type === 'variant') as { id: string } | undefined;
        let turnaroundUrl = 'unknown_variant_url';
        
        if (variantSeg) {
          outer: for (const soul of Object.values(soulIds)) {
            for (const v of soul.variants) {
              if (v.id === variantSeg.id) {
                turnaroundUrl = v.turnaroundUrl;
                break outer;
              }
            }
          }
        }

        queueTask({
          shotId: shot.id,
          providerId: 'face-lock-engine',
          status: 'polling',
          resultUrl: turnaroundUrl // Just storing it here temporarily or logging it
        });
      }
    } finally {
      setIsRendering(false);
    }
  };

  const handleEnhance = async () => {
    if (!googleAiKey) {
      alert("Please configure your Google AI Studio API key in Settings (BYOK).");
      return;
    }
    setIsEnhancing(true);
    try {
      /* eCoT: 
       * 1. Extract environment entity to get lighting setup
       * 2. Pass raw text + metadata + visual target to LLM
       * 3. Commit structured enhancement to store
       */
      const envSeg = shot.structuredPrompt.find(s => s.type === 'environment') as { id: string } | undefined;
      const envLight = envSeg && environments[envSeg.id] ? environments[envSeg.id].lightSourcePlacement : 'dynamic';
      
      const rawText = shot.rawPrompt || shot.structuredPrompt.map(s => s.type === 'text' ? s.value : s.label).join(' ');
      const result = await enhancePromptText(googleAiKey, rawText, envLight || 'dynamic', visualStyle);
      
      setEnhancedPrompt(shot.id, result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCheckContinuity = async () => {
    if (!googleAiKey) {
      alert("Please configure your Google AI Studio API key in Settings (BYOK).");
      return;
    }
    if (!nextShot) return;

    setIsChecking(true);
    /* eCoT: 
     * 1. Gather URLs (mocked as undefined if missing, relying on rawPrompt for the mock vision check).
     * 2. Send to Vision API to detect discrepancies between Shot A exit and Shot B entry.
     * 3. Update Zustand state with detected error array.
     */
    try {
      const errors = await checkContinuity(
        googleAiKey, 
        shot.videoUrl, 
        nextShot.initImageUrl,
        shot.rawPrompt || shot.structuredPrompt.map(s => s.type === 'text' ? s.value : s.label).join(' '),
        nextShot.rawPrompt || nextShot.structuredPrompt.map(s => s.type === 'text' ? s.value : s.label).join(' ')
      );
      setContinuityErrors(shot.id, errors);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Draggable draggableId={shot.id} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-4 flex flex-col shrink-0 ${snapshot.isDragging ? 'opacity-90 scale-[1.02]' : ''}`}
        >
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#121212] border-l-2 border-orange-500 border border-y-[#222] border-r-[#222] p-4 rounded-r flex flex-col shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-4 cursor-grab active:cursor-grabbing pb-1" {...provided.dragHandleProps}>
                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">{shot.id}</span>
              </div>
              
              {/* Tooltip for Errors */}
              {shot.continuityErrors && shot.continuityErrors.length > 0 && (
                <div className="relative group">
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/50 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-help">
                    <AlertTriangle className="w-3 h-3" />
                    {shot.continuityErrors.length} Flags
                  </div>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A1A] border border-amber-500/50 rounded shadow-xl z-50 p-2 hidden group-hover:block">
                     <div className="text-[9px] uppercase font-bold text-amber-500 mb-1 tracking-widest border-b border-amber-500/20 pb-1">Continuity Mismatches</div>
                     <ul className="list-disc pl-3 mt-1 space-y-1">
                       {shot.continuityErrors.map((err, i) => (
                         <li key={i} className="text-[9px] text-slate-300 leading-tight">{err}</li>
                       ))}
                     </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Inputs & Config */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 mt-2">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Smart Prompt / Action</label>
                  <div className="flex gap-2 items-center">
                    <select 
                      value={visualStyle}
                      onChange={(e) => setVisualStyle(e.target.value)}
                      className="bg-[#121212] border border-[#333] text-slate-400 text-[9px] rounded px-1 py-1 uppercase font-bold outline-none focus:border-orange-500 h-6"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Noir/Chiaroscuro">Noir / Chiaroscuro</option>
                      <option value="Cyberpunk">Cyberpunk</option>
                    </select>

                    <button 
                      onClick={() => toggleFaceLock(shot.id)}
                      className={`text-[9px] px-2 h-6 rounded flex items-center gap-1 font-bold uppercase transition-colors border ${shot.lockFace ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-[#1A1A1A] border-[#333] hover:border-orange-500 text-slate-400'}`}
                    >
                      {shot.lockFace ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      Lock Face
                    </button>
                    <button 
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="text-[9px] bg-[#1A1A1A] border border-[#333] hover:border-orange-500 text-orange-500 px-2 h-6 rounded flex items-center gap-1 font-bold uppercase transition-colors"
                    >
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                      Enhance
                    </button>
                  </div>
                </div>
                <SmartPromptInput shotId={shot.id} />
              </div>
              
              <div className="bg-black/40 border border-[#222] p-3 rounded h-full min-h-[60px]">
                {shot.enhancedPrompt ? (
                  <p className="text-[10px] leading-relaxed text-slate-300">
                    <span className="text-orange-300 font-bold mr-1">[ENHANCED]</span> 
                    {shot.enhancedPrompt}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 italic mt-1">
                    Awaiting Vibe Translator...
                  </p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center border-t border-[#222] pt-3 mt-auto">
              <div className="flex gap-2">
                <button className="text-[9px] text-slate-500 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors">
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button 
                  onClick={() => chainShot(shot.id, shot.videoUrl || 'mock_last_frame.jpg')}
                  className="text-[9px] text-slate-500 hover:text-orange-500 uppercase font-bold flex items-center gap-1 transition-colors border-l border-[#333] pl-2 ml-1"
                >
                  <ImagePlus className="w-3 h-3" /> Chain Frame
                </button>
                <button 
                  onClick={() => addToBRoll(shot.id)}
                  className="text-[9px] text-slate-500 hover:text-orange-500 uppercase font-bold flex items-center gap-1 transition-colors border-l border-[#333] pl-2 ml-1"
                >
                  <Film className="w-3 h-3" /> to B-Roll
                </button>
              </div>
              <button 
                onClick={handleRender}
                disabled={isRendering}
                className="bg-orange-600 text-white text-[9px] px-3 py-1.5 border border-orange-500 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-orange-500 transition-colors shrink-0 whitespace-nowrap disabled:opacity-50"
              >
                {isRendering ? <Loader2 className="w-3 h-3 animate-spin"/> : <Play className="w-3 h-3" />}
                {isRendering ? 'Rendering...' : 'Render'}
              </button>
            </div>
          </div>

          {/* Bridge Button */}
          {!snapshot.isDragging && nextShotId && (
            <div className="flex justify-center -mt-2.5 -mb-2.5 relative z-10 w-full h-8">
              <button 
                onClick={handleCheckContinuity}
                disabled={isChecking}
                className="bg-[#121212] border border-[#333] hover:border-amber-500 text-slate-400 hover:text-amber-500 rounded-full px-3 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors shadow-lg"
              >
                {isChecking ? <Loader2 className="w-3 h-3 animate-spin"/> : <LinkIcon className="w-3 h-3" />}
                Check Continuity
              </button>
            </div>
          )}
          {snapshot.isDragging && nextShotId && <div className="h-4"></div> /* Spacer */}
        </div>
      )}
    </Draggable>
  );
}
