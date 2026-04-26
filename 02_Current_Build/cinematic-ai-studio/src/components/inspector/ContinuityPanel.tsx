import React from "react";
import { useStore } from "../../store";
import { AlertTriangle, AlertCircle, Info, Check, Wand2 } from "lucide-react";
import { ContinuityIssue, Shot } from "../../types";

export function ContinuityPanel({ shot }: { shot: Shot }) {
  const { shots, scenes, characters, addContinuityIssue, clearContinuityIssues } = useStore();

  const issues = shot.continuityIssues || [];

  const runContinuityCheck = () => {
    clearContinuityIssues(shot.id);
    
    // Simple Heuristic: Check previous shot in scene
    const scene = scenes.find(s => s.id === shot.sceneId);
    if (!scene) return;

    const currentIndex = scene.shotIds.indexOf(shot.id);
    if (currentIndex <= 0) return;

    const prevShotId = scene.shotIds[currentIndex - 1];
    const prevShot = shots[prevShotId];
    if (!prevShot) return;

    // 1. Character/Outfit Continuity
    shot.characterIds.forEach(cid => {
      if (prevShot.characterIds.includes(cid)) {
        const currentOutfit = shot.outfitIds[cid];
        const prevOutfit = prevShot.outfitIds[cid];
        const char = characters.find(c => c.id === cid);

        if (currentOutfit !== prevOutfit) {
          addContinuityIssue(shot.id, {
            type: "wardrobe",
            severity: "warning",
            message: `Wardrobe mismatch for ${char?.displayName || cid}. Prev: ${prevOutfit || 'Default'}, Current: ${currentOutfit || 'Default'}.`,
            suggestion: "Verify if this is a motivated wardrobe change or a mistake."
          });
        }
      }
    });

    // 2. Location Continuity
    if (shot.locationId && prevShot.locationId && shot.locationId !== prevShot.locationId) {
       addContinuityIssue(shot.id, {
         type: "location",
         severity: "error",
         message: "Scene location jump detected without transition.",
         suggestion: "Consider adding a Cutaway or Establishing shot if the location has changed within the same scene."
       });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-1">
        <h3 className="text-[9px] mono uppercase tracking-widest text-zinc-600 font-bold flex items-center gap-1.5">
          Continuity Scan
        </h3>
        <button 
          onClick={runContinuityCheck}
          className="text-[8px] mono bg-ink-800 hover:bg-zinc-700 px-2 py-0.5 rounded border border-line text-zinc-400 transition-all flex items-center gap-1"
        >
          <Wand2 size={10} /> RE-SCAN
        </button>
      </div>

      {issues.length > 0 ? (
        <div className="space-y-2">
          {issues.map((issue) => (
            <div 
              key={issue.id} 
              className={`p-3 rounded border flex gap-3 ${
                issue.severity === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-200' :
                issue.severity === 'warning' ? 'bg-orange-500/5 border-orange-500/20 text-orange-200' :
                'bg-cyan-500/5 border-cyan-500/20 text-cyan-200'
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {issue.severity === 'error' ? <AlertCircle size={14} /> :
                 issue.severity === 'warning' ? <AlertTriangle size={14} /> :
                 <Info size={14} />}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium leading-normal">{issue.message}</p>
                {issue.suggestion && (
                  <p className="text-[9px] opacity-60 leading-normal italic">💡 Suggestion: {issue.suggestion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center bg-lime-500/5 border border-lime-500/10 rounded-lg">
           <div className="flex flex-col items-center gap-2">
             <Check size={20} className="text-lime-500 opacity-50" />
             <p className="text-[9px] mono text-lime-500/80 uppercase">Sequence Consistent</p>
           </div>
        </div>
      )}
    </div>
  );
}
