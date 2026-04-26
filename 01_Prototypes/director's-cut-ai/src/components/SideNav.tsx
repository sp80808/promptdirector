import React from 'react';
import { Film, Image as ImageIcon, LayoutGrid, Settings, Inbox, Download, Palette } from 'lucide-react';
import { useStore, AppView } from '../store';
import { cn } from '../lib/utils';

export function SideNav() {
  const { currentView, setCurrentView, setSettingsOpen } = useStore();

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'matrix', label: 'Prompt Matrix', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'moodboard', label: 'Moodboard', icon: <Palette className="w-4 h-4" /> },
    { id: 'vault', label: 'Character Vault', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'scout', label: 'Location Scout', icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 bg-[#0E0E0E] border-r border-[#2D2D2D] flex flex-col h-screen shrink-0">
      <div className="p-6">
        <h1 className="text-sm font-semibold tracking-widest uppercase text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
            DC
          </div>
          Director's Cut
        </h1>
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> AI STUDIO READY
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest transition-colors",
              currentView === item.id 
                ? "bg-[#1A1A1A] text-orange-500 shadow-[inset_2px_0_0_#f97316] border border-[#333]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-[#1A1A1A] border border-transparent"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-[#2D2D2D]/50">
          <div className="px-3 mb-2 text-[9px] uppercase font-bold text-slate-600 tracking-widest">Smart Bins</div>
          <button 
            onClick={() => setCurrentView('broll')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest transition-colors",
              currentView === 'broll'
                ? "bg-[#1A1A1A] text-orange-500 shadow-[inset_2px_0_0_#f97316] border border-[#333]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-[#1A1A1A] border border-transparent"
            )}
          >
            <Inbox className="w-4 h-4" />
            B-Roll Bucket
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-[#2D2D2D] flex flex-col gap-2">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#1A1A1A] border border-[#333] text-orange-500 hover:bg-orange-600/10 hover:border-orange-500 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export NLE
          </div>
          <span className="text-[8px] bg-black px-1.5 py-0.5 rounded text-orange-400">XML/EDL</span>
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings (BYOK)
        </button>
      </div>
    </div>
  );
}
