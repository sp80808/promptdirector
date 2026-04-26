import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { 
  Clapperboard, 
  Users, 
  Map as MapIcon, 
  Settings as SettingsIcon, 
  Play, 
  Layers, 
  Search,
  Plus,
  Box,
  Download
} from 'lucide-react';
import { Timeline } from './components/timeline/Timeline';
import { CharacterForge } from './components/views/CharacterForge';
import { LocationScout } from './components/views/LocationScout';
import { PropRoom } from './components/views/PropRoom';
import { Inspector } from './components/inspector/Inspector';
import { ScriptBreakdownModal } from './components/modals/ScriptBreakdownModal';
import { ExportModal } from './components/modals/ExportModal';
import { MediaViewer } from './components/modals/MediaViewer';
import { VideoPlayer } from './components/modals/VideoPlayer';
import { Moodboard } from './components/views/Moodboard';
import { initializeDefaultAgents } from './utils/agents/registry';
import { RenderQueue } from './components/layout/RenderQueue';

type View = 'project' | 'characters' | 'concepts' | 'locations' | 'props';

export default function App() {
  const { modal, setModal, apiKeys, setApiKey } = useStore();
  const [currentView, setCurrentView] = useState<View>('project');

  // Initialize agents on mount
  useEffect(() => {
    initializeDefaultAgents();
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      
      // J: Rewind (placeholder for now)
      if (key === 'j') console.log('Rewind');
      // K: Play/Pause (placeholder)
      if (key === 'k') setModal({ kind: 'player' });
      // L: Fast Forward (placeholder)
      if (key === 'l') console.log('Fast Forward');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setModal]);

  return (
    <div className="h-screen flex flex-col bg-ink-950 text-slate-300">
      {/* Top Header */}
      <header className="h-12 border-b border-line flex items-center justify-between px-4 bg-ink-900 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold tracking-tighter text-lg text-white">CINEMATIC<span className="text-accent">.AI</span></span>
          <div className="h-4 w-[1px] bg-line mx-2" />
          <span className="text-[10px] mono text-zinc-500 uppercase tracking-widest">v5.0 Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setModal({ kind: 'player' })}
            className="flex items-center gap-1 bg-ink-800 border border-line hover:border-lime-500/50 rounded px-3 py-1.5 transition-colors group"
          >
            <Play className="w-3 h-3 text-lime-400 fill-lime-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] mono text-lime-400 font-bold uppercase tracking-widest ml-1">Play Cut</span>
          </button>
          <button 
            onClick={() => setModal({ kind: 'export' })}
            className="nle-button py-1 px-3 flex items-center gap-2 border-accent/20 text-accent hover:bg-accent/10"
          >
            <Download size={12} /> EXPORT
          </button>
          <button 
            onClick={() => setModal({ kind: 'settings' })}
            className="p-2 hover:bg-ink-800 rounded transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Nav */}
        <aside className="w-16 border-r border-line flex flex-col items-center py-6 gap-6 bg-ink-900 z-40">
          <NavIcon 
            icon={<Layers />} 
            label="Project" 
            active={currentView === 'project'} 
            onClick={() => setCurrentView('project')} 
          />
          <NavIcon 
            icon={<Users />} 
            label="Characters" 
            active={currentView === 'characters'} 
            onClick={() => setCurrentView('characters')} 
          />
          <NavIcon 
            icon={<Search />} 
            label="Concepts" 
            active={currentView === 'concepts'} 
            onClick={() => setCurrentView('concepts')} 
          />
          <NavIcon 
            icon={<MapIcon />} 
            label="Locations" 
            active={currentView === 'locations'} 
            onClick={() => setCurrentView('locations')} 
          />
          <NavIcon 
            icon={<Box />} 
            label="Props" 
            active={currentView === 'props'} 
            onClick={() => setCurrentView('props')} 
          />
          <div className="mt-auto">
            <NavIcon icon={<Plus />} label="New" onClick={() => {}} />
          </div>
        </aside>

        {/* Central Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-ink-950">
          {currentView === 'project' && <Timeline />}
          {currentView === 'characters' && <CharacterForge />}
          {currentView === 'concepts' && <Moodboard />}
          {currentView === 'locations' && <LocationScout />}
          {currentView === 'props' && <PropRoom />}
        </main>

        {/* Right Inspector */}
        {currentView === 'project' && (
          <aside className="w-80 shrink-0">
            <Inspector />
          </aside>
        )}
      </div>

      {/* Modals */}
      {modal?.kind === 'settings' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md nle-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button onClick={() => setModal(null)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] mono uppercase text-zinc-500 font-bold">Google AI Key</label>
                <input 
                  type="password" 
                  value={apiKeys.google || ""}
                  onChange={(e) => setApiKey("google", e.target.value)}
                  placeholder="AI Studio Key..." 
                  className="nle-input" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] mono uppercase text-zinc-500 font-bold">SiliconFlow Key</label>
                <input 
                  type="password" 
                  value={apiKeys.siliconFlow || ""}
                  onChange={(e) => setApiKey("siliconFlow", e.target.value)}
                  placeholder="SiliconFlow API Key..." 
                  className="nle-input" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] mono uppercase text-zinc-500 font-bold">Runway Key</label>
                <input 
                  type="password" 
                  value={apiKeys.runway || ""}
                  onChange={(e) => setApiKey("runway", e.target.value)}
                  placeholder="Runway API Key..." 
                  className="nle-input" 
                />
              </div>
            </div>

            <button onClick={() => setModal(null)} className="w-full nle-button py-2 bg-accent text-black font-bold border-none">SAVE CONFIGURATION</button>
          </div>
        </div>
      )}

      {modal?.kind === 'media_viewer' && (
        <MediaViewer shotId={modal.shotId} takeId={modal.takeId} />
      )}

      {modal?.kind === 'script_breakdown' && <ScriptBreakdownModal />}
      {modal?.kind === 'export' && <ExportModal />}
      {modal?.kind === 'player' && <VideoPlayer />}

      <RenderQueue />
    </div>
  );
}

function NavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div className="group relative flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 hover:bg-ink-800 hover:text-zinc-300'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <span className="absolute left-16 bg-ink-800 text-white text-[10px] px-2 py-1 rounded border border-line opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {label}
      </span>
    </div>
  );
}
