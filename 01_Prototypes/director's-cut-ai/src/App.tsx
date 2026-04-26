import { SettingsModal } from './components/SettingsModal';
import { SideNav } from './components/SideNav';
import { PromptMatrix } from './components/PromptMatrix';
import { CharacterVault } from './components/CharacterVault';
import { LocationScout } from './components/LocationScout';
import { BRollBucket } from './components/BRollBucket';
import { Moodboard } from './components/Moodboard';
import { useStore } from './store';

export default function App() {
  const { currentView } = useStore();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0A0A0A] text-slate-300 overflow-hidden font-sans">
      {/* Settings Modal (BYOK API Keys) */}
      <SettingsModal />

      {/* Main Sidebar */}
      <SideNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="h-full w-full max-w-[1400px] mx-auto">
          {currentView === 'matrix' && <PromptMatrix />}
          {currentView === 'vault' && <CharacterVault />}
          {currentView === 'scout' && <LocationScout />}
          {currentView === 'broll' && <BRollBucket />}
          {currentView === 'moodboard' && <Moodboard />}
        </div>
      </main>
    </div>
  );
}
