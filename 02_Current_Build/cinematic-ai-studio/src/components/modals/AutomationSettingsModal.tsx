import { useStore } from "@/store";
import type { AutomationConfig } from "@/types";
import { 
  Settings, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Wand2,
  PlayCircle,
  Brain
} from "lucide-react";

export function AutomationSettingsModal() {
  const { automationConfig, updateAutomationConfig, setModal } = useStore();

  const updateSection = <K extends keyof AutomationConfig>(
    key: K,
    updates: Partial<AutomationConfig[K]>
  ) => {
    updateAutomationConfig({
      [key]: { ...automationConfig[key], ...updates }
    } as any);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            <h2 className="text-[10px] mono uppercase tracking-widest text-zinc-400 font-bold">Automation Settings</h2>
          </div>
          <button onClick={() => setModal(null)} className="p-1 text-zinc-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Prompt Enhancer */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Sparkles size={14} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Prompt Enhancer</h3>
                  <p className="text-[9px] text-zinc-500">AI expands rough ideas into cinematic prompts</p>
                </div>
              </div>
              <button
                onClick={() => updateSection('promptEnhancer', { enabled: !automationConfig.promptEnhancer.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  automationConfig.promptEnhancer.enabled ? 'bg-accent' : 'bg-ink-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    automationConfig.promptEnhancer.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            
            {automationConfig.promptEnhancer.enabled && (
              <div className="ml-10 space-y-2">
                <label className="text-[8px] mono uppercase text-zinc-500">Enhancement Level</label>
                <div className="flex gap-2">
                  {(['light', 'moderate', 'aggressive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSection('promptEnhancer', { level })}
                      className={`px-2 py-1 text-[9px] mono rounded border transition-all ${
                        automationConfig.promptEnhancer.level === level
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-ink-800 border-line text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-zinc-600">
                  {automationConfig.promptEnhancer.level === 'light' && 'Minimal expansion: fixes grammar, adds key terms only.'}
                  {automationConfig.promptEnhancer.level === 'moderate' && 'Balanced: adds 2-3 cinematic details per prompt.'}
                  {automationConfig.promptEnhancer.level === 'aggressive' && 'Full rewrite: extensive detail and terminology.'}
                </p>
              </div>
            )}
          </section>

          {/* Take Curator & Auto-Approval */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                  <PlayCircle size={14} className="text-lime-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Take Curator</h3>
                  <p className="text-[9px] text-zinc-500">AI scores takes and recommends best</p>
                </div>
              </div>
              <button
                onClick={() => updateSection('takeCurator', { enabled: !automationConfig.takeCurator?.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  automationConfig.takeCurator?.enabled ? 'bg-lime-500' : 'bg-ink-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    automationConfig.takeCurator?.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {automationConfig.takeCurator?.enabled && (
              <div className="ml-10 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] mono">
                    <span className="text-zinc-500">Auto-Approve Score Threshold</span>
                    <span className="text-lime-500">{automationConfig.autoApproval.minScore}+/10</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="10"
                    step="0.5"
                    value={automationConfig.autoApproval.minScore}
                    onChange={(e) => updateSection('autoApproval', { minScore: parseFloat(e.target.value) })}
                    className="w-full accent-lime-500"
                  />
                  <p className="text-[8px] text-zinc-600">
                    Takes scoring {automationConfig.autoApproval.minScore}+ automatically get approved.
                    Disable auto-approval to review manually.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSection('autoApproval', { enabled: !automationConfig.autoApproval.enabled })}
                    className={`text-[8px] px-2 py-1 rounded border ${
                      automationConfig.autoApproval.enabled
                        ? 'bg-lime-500/20 border-lime-500/50 text-lime-500'
                        : 'bg-ink-800 border-line text-zinc-400'
                    }`}
                  >
                    {automationConfig.autoApproval.enabled ? 'AUTO-APPROVE ON' : 'MANUAL REVIEW ONLY'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Continuity Check */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <AlertTriangle size={14} className="text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Continuity Inspector</h3>
                  <p className="text-[9px] text-zinc-500">Auto-detect wardrobe, prop, position breaks</p>
                </div>
              </div>
              <button
                onClick={() => updateSection('continuityCheck', { enabled: !automationConfig.continuityCheck.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  automationConfig.continuityCheck.enabled ? 'bg-cyan-500' : 'bg-ink-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    automationConfig.continuityCheck.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {automationConfig.continuityCheck.enabled && (
              <div className="ml-10 space-y-2">
                <label className="text-[8px] mono uppercase text-zinc-500">Alert Severity</label>
                <div className="flex gap-2">
                  {(['warning', 'error'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSection('continuityCheck', { severityThreshold: level })}
                      className={`px-2 py-1 text-[9px] mono rounded border transition-all ${
                        automationConfig.continuityCheck.severityThreshold === level
                          ? level === 'error'
                            ? 'bg-red-500/10 border-red-500/50 text-red-500'
                            : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                          : 'bg-ink-800 border-line text-zinc-400'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-zinc-600">
                  Filters which issues to flag. "Warning" shows all; "Error" shows only blocking issues.
                </p>
              </div>
            )}
          </section>

          {/* Shot Suggester */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Wand2 size={14} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Shot Suggester</h3>
                  <p className="text-[9px] text-zinc-500">Recommends next coverage shots in timeline</p>
                </div>
              </div>
              <button
                onClick={() => updateSection('shotSuggester', { enabled: !automationConfig.shotSuggester?.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  automationConfig.shotSuggester?.enabled ? 'bg-purple-500' : 'bg-ink-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    automationConfig.shotSuggester?.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between">
            <button
              onClick={() => {
                // Reset to defaults
                updateAutomationConfig({
                  promptEnhancer: { enabled: true, level: "moderate" },
                  autoApproval: { enabled: false, minScore: 8.5 },
                  continuityCheck: { enabled: true, severityThreshold: "warning" },
                  shotSuggester: { enabled: true },
                  takeCurator: { enabled: true }
                });
              }}
              className="text-[9px] text-zinc-500 hover:text-white underline"
            >
            Reset Defaults
          </button>
          <button
            onClick={() => setModal(null)}
            className="nle-button px-6 py-2 bg-accent text-black font-bold border-none text-[10px]"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
}
