import React, { useState, useEffect, useCallback } from 'react';
import { useDirectorStore, type Character, type Shot, type Take, type Location } from './store';
import { 
  Clapperboard, Film, Plus, Settings, Download, Star, Play, Trash2, 
  Copy, Image as ImageIcon, Mic, Clock, User, MapPin, Zap 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

const STAR_COLORS = ['#f59e0b', '#eab308', '#facc15'];

function App() {
  const {
    characters,
    locations,
    shots,
    selectedShotId,
    apiKeys,
    audioTrack,
    shotsActions,
    addCharacter,
    updateCharacter,
    createVariant,
    deleteCharacter,
    addLocation,
    selectShot,
    setApiKeys,
    uploadAudio,
    generatePromptForShot,
    setSelectedTakes,
  } = useDirectorStore();

  const selectedShot = shots.find(s => s.id === selectedShotId) || null;
  const selectedCharacter = selectedShot ? characters.find(c => c.id === selectedShot.characterId) : null;
  const selectedLocation = selectedShot ? locations.find(l => l.id === selectedShot.locationId) : null;

  const [showForgeModal, setShowForgeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [newChar, setNewChar] = useState({
    name: '',
    age: 28,
    traits: '',
    seed: Math.floor(Math.random() * 900000) + 100000,
    clothing: 'Default tactical attire',
  });
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    timeOfDay: 'Night',
    lighting: '',
  });
  const [variantClothing, setVariantClothing] = useState('');
  const [activeCharacterForVariant, setActiveCharacterForVariant] = useState<string | null>(null);
  const [apiInput, setApiInput] = useState(apiKeys);
  const [compareTakeIds, setCompareTakeIds] = useState<string[]>([]);
  const [timelineScale, setTimelineScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault();
        if (selectedShotId) {
          shotsActions.addTake(selectedShotId);
        }
      }
      
      if (e.key.toLowerCase() === 'j') {
        // Simulate rewind
        setIsPlaying(false);
      }
      if (e.key.toLowerCase() === 'k') {
        setIsPlaying(p => !p);
      }
      if (e.key.toLowerCase() === 'l') {
        // Simulate fast forward
        setIsPlaying(false);
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Simulate save
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50';
        notif.innerHTML = '✅ Project Saved to LocalStorage';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 1800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShotId, shotsActions]);

  const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(shots);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    shotsActions.reorderShots(items);
  };

  const handleAddShot = (charId: string, locId?: string) => {
    const locToUse = locId || locations[0]?.id;
    if (locToUse) {
      shotsActions.addShot(charId, locToUse);
    }
  };

  const handleCreateCharacter = () => {
    if (!newChar.name || !newChar.traits) return;
    
    addCharacter({
      ...newChar,
      isBase: true,
    });
    
    setNewChar({
      name: '',
      age: 28,
      traits: '',
      seed: Math.floor(Math.random() * 900000) + 100000,
      clothing: 'Default tactical attire',
    });
    setShowForgeModal(false);
  };

  const handleCreateVariant = () => {
    if (!activeCharacterForVariant || !variantClothing) return;
    createVariant(activeCharacterForVariant, variantClothing);
    setVariantClothing('');
    setActiveCharacterForVariant(null);
  };

  const handleFileUploadForChar = (charId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateCharacter(charId, { referenceImage: e.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const exportEDL = () => {
    if (shots.length === 0) return;
    
    let edlContent = `TITLE: MASTER_BLUEPRINT_SEQUENCE\nFCM: NON-DROP FRAME\n\n`;
    
    shots.forEach((shot, index) => {
      const char = characters.find(c => c.id === shot.characterId);
      const startFrame = Math.floor(shot.startTime * 24);
      const endFrame = Math.floor((shot.startTime + shot.duration) * 24);
      
      edlContent += `${index + 1}  AX  V     ${startFrame.toString().padStart(6, '0')} ${endFrame.toString().padStart(6, '0')} ${startFrame.toString().padStart(6, '0')} ${endFrame.toString().padStart(6, '0')}\n`;
      edlContent += `* FROM CLIP NAME: ${char?.name || 'UNKNOWN'} - ${shot.fullPrompt.substring(0, 45)}...\n\n`;
    });
    
    const blob = new Blob([edlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'master_blueprint_sequence.edl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-sm px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100]';
    notif.innerHTML = `📼 EDL / XML Exported • Ready for DaVinci Resolve`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2600);
  };

  const fakeWaveform = audioTrack.waveform || Array.from({length: 58}, (_,i) => 0.3 + Math.sin(i / 4) * 0.4 + Math.random() * 0.4);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white font-mono">
      {/* NAVBAR */}
      <nav className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-[-2px] text-white">MASTER BLUEPRINT</div>
              <div className="text-[10px] text-zinc-500 -mt-1">DIRECTOR'S STUDIO v0.8.4</div>
            </div>
          </div>
          
          <div className="ml-8 flex items-center gap-2 text-xs uppercase tracking-[1px] bg-zinc-900 px-4 h-7 rounded border border-zinc-700">
            PROJECT: <span className="text-emerald-400 font-medium">NEON_REBELLION_v12</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 rounded-lg text-xs px-3 py-1 border border-zinc-800">
            <div className="px-3 py-0.5 border-r border-zinc-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {totalDuration}s
            </div>
            <div className="px-3 py-0.5 flex items-center gap-1.5 text-amber-400">
              <span className="text-emerald-400">24</span> FPS
            </div>
          </div>

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 transition-colors px-4 h-9 rounded-xl text-sm border border-zinc-700"
          >
            <Settings className="w-4 h-4" />
            BYOK KEYS
          </button>

          <button 
            onClick={exportEDL}
            className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-amber-300 transition-all px-5 h-9 rounded-xl text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            EXPORT EDL
          </button>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${isPlaying ? 'bg-red-500/80' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isPlaying ? <span className="text-xs">⏹</span> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: CHARACTER FORGE + LIBRARY */}
        <div className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <div className="uppercase text-xs tracking-[2px] text-zinc-500 mb-3">THE FORGE</div>
            
            <button 
              onClick={() => setShowForgeModal(true)}
              className="w-full h-11 bg-white text-zinc-950 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all font-medium text-sm shadow-inner"
            >
              <Plus className="w-4 h-4" /> FORGE MASTER CHARACTER
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-5 custom-scroll">
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" /> CHARACTERS
                </div>
                <div className="text-[10px] px-2 py-px bg-zinc-900 rounded text-zinc-400">SEED LOCKED</div>
              </div>
              
              <div className="space-y-2">
                {characters.filter(c => c.isBase).map((char) => {
                  const variants = characters.filter(v => v.baseId === char.id || v.id === char.id);
                  
                  return (
                    <div key={char.id} className="group bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-violet-500/30 transition-all">
                      <div className="p-4 flex gap-3">
                        <div 
                          className="w-12 h-12 bg-zinc-800 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-700"
                          onClick={() => {
                            if (char.referenceImage) return;
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUploadForChar(char.id, file);
                            };
                            input.click();
                          }}
                        >
                          {char.referenceImage ? (
                            <img src={char.referenceImage} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-3xl opacity-40">🧬</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-lg tracking-tight">@{char.name}</div>
                            <div className="font-mono text-[10px] text-amber-400 bg-zinc-950 px-1.5 rounded">S:{char.seed}</div>
                          </div>
                          <div className="text-xs text-zinc-400 line-clamp-1">{char.traits}</div>
                          <div className="text-[10px] text-emerald-300 mt-1">{char.age} • {char.clothing.split(',')[0]}</div>
                        </div>
                      </div>
                      
                      {/* Variants */}
                      {variants.length > 1 && (
                        <div className="border-t border-zinc-800 bg-black/40 px-4 py-3 text-xs">
                          <div className="text-zinc-500 mb-2">OUTFIT VARIANTS</div>
                          <div className="flex flex-wrap gap-2">
                            {variants.map((v, idx) => (
                              <div 
                                key={v.id}
                                onClick={() => handleAddShot(v.id)}
                                className="cursor-grab active:cursor-grabbing bg-zinc-950 border border-zinc-700 hover:border-fuchsia-400 px-3 py-1 rounded-3xl text-[10px] transition-colors"
                              >
                                {v.clothing.length > 18 ? v.clothing.substring(0,15)+'...' : v.clothing}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex border-t border-zinc-800 text-xs">
                        <button 
                          onClick={() => setActiveCharacterForVariant(char.id)}
                          className="flex-1 py-3 hover:bg-zinc-800 flex items-center justify-center gap-1.5 text-violet-400"
                        >
                          <Copy className="w-3 h-3" /> VARIANT
                        </button>
                        <button 
                          onClick={() => handleAddShot(char.id)}
                          className="flex-1 py-3 hover:bg-emerald-950 border-l border-zinc-800 flex items-center justify-center gap-1 text-emerald-400"
                        >
                          <Zap className="w-3 h-3" /> TO TIMELINE
                        </button>
                        <button 
                          onClick={() => deleteCharacter(char.id)}
                          className="flex items-center justify-center w-9 border-l border-zinc-800 hover:bg-red-950/70 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LOCATIONS */}
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" /> LOCATIONS
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Location name?");
                    if (!name) return;
                    addLocation({
                      name,
                      description: prompt("Description?") || "Mysterious cinematic environment",
                      timeOfDay: "Dusk",
                      lighting: "Moody volumetric lighting, 4500K practicals"
                    });
                  }}
                  className="text-cyan-400 text-xs flex items-center gap-1 hover:text-white"
                >
                  <Plus className="w-3 h-3" /> ADD
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {locations.map((loc) => (
                  <div 
                    key={loc.id}
                    onClick={() => {
                      // Select first character and add shot
                      if (characters.length > 0) {
                        handleAddShot(characters[0].id, loc.id);
                      }
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 p-3 rounded-3xl cursor-pointer border border-transparent hover:border-cyan-400/50 group transition-all"
                  >
                    <div className="text-xs uppercase tracking-widest text-cyan-400 mb-1">{loc.timeOfDay}</div>
                    <div className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-white">{loc.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-3 line-clamp-2">{loc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AUDIO TRACK */}
          <div className="border-t border-zinc-800 p-4 bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs uppercase">
                <Mic className="w-3.5 h-3.5 text-pink-400" />
                AUDIO CUE
              </div>
              <label className="cursor-pointer text-pink-400 hover:text-pink-300 text-xs flex items-center gap-1">
                UPLOAD
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAudio(file);
                  }}
                />
              </label>
            </div>
            
            {audioTrack.name ? (
              <div className="text-[10px] text-zinc-400 mb-2 truncate">{audioTrack.name}</div>
            ) : (
              <div className="text-[10px] italic text-zinc-500">No audio loaded • Drag MP3 here</div>
            )}
            
            <div className="h-14 bg-black/60 rounded-2xl relative overflow-hidden flex items-end px-2 py-1">
              {fakeWaveform.map((amp, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-t from-pink-400 to-violet-400 transition-all"
                  style={{
                    height: `${amp * 100}%`,
                    width: '2.5px',
                    marginRight: '1.5px',
                    opacity: isPlaying ? 0.9 : 0.4
                  }}
                />
              ))}
            </div>
            <div className="text-right text-[9px] text-zinc-500 mt-1">MATCH MOVEMENT TO BEAT</div>
          </div>
        </div>

        {/* CENTER TIMELINE */}
        <div className="flex-1 flex flex-col">
          {/* TIMELINE HEADER */}
          <div className="h-16 border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-md flex items-center px-6 text-xs uppercase tracking-widest z-10">
            <div className="flex-1 flex items-center gap-8">
              <div>SHOT SEQUENCER</div>
              <div className="flex items-center gap-4 text-zinc-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> LIVE
                </div>
                <div>FRAME ACCURATE</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-[10px]">
              <button onClick={() => setTimelineScale(Math.max(0.4, timelineScale - 0.2))} className="hover:text-white px-2 py-1">-</button>
              <div className="tabular-nums w-8 text-center">{Math.round(timelineScale * 100)}%</div>
              <button onClick={() => setTimelineScale(Math.min(3, timelineScale + 0.2))} className="hover:text-white px-2 py-1">+</button>
              
              <div className="ml-6 px-4 py-1 bg-zinc-800 rounded-3xl text-emerald-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {shots.length} SHOTS
              </div>
            </div>
          </div>

          {/* VISUAL TIMELINE RULER */}
          <div className="h-16 border-b border-zinc-800 bg-black/60 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 flex items-end px-8" style={{ transform: `scaleX(${timelineScale})`, transformOrigin: 'left' }}>
              {Array.from({ length: Math.ceil(totalDuration / 4) + 1 }).map((_, i) => (
                <div key={i} className="absolute h-full flex flex-col justify-end items-center" style={{ left: `${i * 80}px` }}>
                  <div className="text-[10px] text-zinc-400 font-medium tabular-nums mb-1">{i * 4}</div>
                  <div className="h-6 w-px bg-zinc-700" />
                </div>
              ))}
              
              {/* Shot blocks on ruler */}
              {shots.map((shot, idx) => {
                const leftPos = (shot.startTime / totalDuration) * 100;
                const widthPercent = (shot.duration / totalDuration) * 100;
                const char = characters.find(c => c.id === shot.characterId);
                
                return (
                  <motion.div 
                    key={shot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 h-2/3 border-l-2 border-violet-400 bg-gradient-to-b from-violet-500/10 to-transparent flex items-center px-3 text-[10px] font-medium cursor-pointer hover:from-violet-400/30 transition-all overflow-hidden"
                    style={{ 
                      left: `${leftPos}%`, 
                      width: `${Math.max(widthPercent, 4)}%` 
                    }}
                    onClick={() => selectShot(shot.id)}
                  >
                    <div className="truncate max-w-[120px] text-violet-200">@{char?.name} • {shot.duration}s</div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* SHOT LIST */}
          <div className="flex-1 overflow-auto p-6 custom-scroll bg-zinc-950" id="timeline-drop">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="shots">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {shots.length === 0 ? (
                      <div className="h-80 flex flex-col items-center justify-center text-center border border-dashed border-zinc-700 rounded-3xl">
                        <div className="text-6xl mb-6 opacity-20">🎬</div>
                        <div className="text-xl font-light text-zinc-400">Your sequence is empty</div>
                        <div className="text-zinc-500 mt-2 max-w-[240px]">Drag a character from the left and a location to begin building your shot list</div>
                        <button 
                          onClick={() => {
                            if (characters.length > 0 && locations.length > 0) {
                              shotsActions.addShot(characters[0].id, locations[0].id);
                            }
                          }}
                          className="mt-8 text-xs border border-white/30 hover:bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-2"
                        >
                          ADD FIRST SHOT
                        </button>
                      </div>
                    ) : (
                      shots.map((shot, index) => {
                        const character = characters.find(c => c.id === shot.characterId);
                        const location = locations.find(l => l.id === shot.locationId);
                        const isSelected = shot.id === selectedShotId;
                        
                        return (
                          <Draggable key={shot.id} draggableId={shot.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-zinc-900 border ${isSelected ? 'border-violet-400 shadow-xl shadow-violet-500/20' : 'border-zinc-800 hover:border-zinc-600'} rounded-3xl p-5 transition-all cursor-pointer ${snapshot.isDragging ? 'scale-[1.02] shadow-2xl' : ''}`}
                                onClick={() => selectShot(shot.id)}
                              >
                                <div className="flex items-start gap-5">
                                  {/* Order */}
                                  <div className="font-mono text-xs w-6 h-6 rounded-2xl bg-black flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex gap-3 items-center">
                                      {character && (
                                        <div className="flex items-center gap-2 bg-zinc-950 text-xs rounded-3xl px-4 py-1 border border-zinc-700">
                                          <div className="text-violet-400">@{character.name}</div>
                                          <div className="text-amber-400 font-mono text-[10px]">S{character.seed}</div>
                                        </div>
                                      )}
                                      
                                      {location && (
                                        <div className="flex items-center gap-2 text-xs bg-zinc-950 rounded-3xl px-4 py-1 border border-cyan-900 text-cyan-300">
                                          📍 {location.name}
                                        </div>
                                      )}
                                      
                                      <div className="ml-auto flex items-center gap-4 text-xs">
                                        <div 
                                          className="tabular-nums flex items-center gap-1.5 bg-zinc-950 px-3 py-1 rounded-3xl border border-zinc-700"
                                        >
                                          <div className="text-emerald-400">⏱</div> 
                                          {shot.duration}s
                                        </div>
                                        
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); shotsActions.deleteShot(shot.id); }}
                                          className="text-red-400/60 hover:text-red-400 p-1"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4 text-xs leading-snug text-zinc-400 line-clamp-2 font-light">
                                      {shot.fullPrompt.substring(0, 145)}...
                                    </div>
                                    
                                    <div className="mt-5 flex items-center gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="text-rose-400">🎭</div>
                                        <span>{shot.emotionArc.split(' ').slice(0, 3).join(' ')}</span>
                                      </div>
                                      
                                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                      
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          shotsActions.addTake(shot.id);
                                        }}
                                        className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 px-5 py-2 rounded-3xl cursor-pointer transition-colors"
                                      >
                                        <Film className="w-3.5 h-3.5" /> GENERATE TAKE
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Takes count */}
                                {shot.takes.length > 0 && (
                                  <div className="mt-4 flex gap-2">
                                    {shot.takes.slice(0, 4).map((take, i) => (
                                      <div 
                                        key={take.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          selectShot(shot.id);
                                          setSelectedTakes([take.id]);
                                          setShowCompareModal(true);
                                        }}
                                        className="flex-1 h-2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full relative"
                                        style={{opacity: 0.6 + (take.rating / 10)}}
                                      >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-300">T{take.number}</div>
                                      </div>
                                    ))}
                                    {shot.takes.length > 4 && <div className="text-[10px] self-center text-zinc-500">+{shot.takes.length - 4}</div>}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* FOOTER BAR */}
          <div className="h-11 bg-zinc-900 border-t border-zinc-700 flex items-center px-6 text-xs text-zinc-400 justify-between">
            <div>Hold <span className="font-mono text-white mx-1 bg-zinc-800 px-1 rounded">J</span> <span className="font-mono text-white mx-1 bg-zinc-800 px-1 rounded">K</span> <span className="font-mono text-white mx-1 bg-zinc-800 px-1 rounded">L</span> for transport controls • Cmd/Ctrl + Enter for new take</div>
            <div className="flex items-center gap-5 text-[10px]">
              <div>NANO BANANA IMAGE INJECTION ENABLED</div>
              <div className="bg-emerald-500/10 text-emerald-400 px-3 py-px rounded">SEEDANCE 2.0 CONNECTED</div>
            </div>
          </div>
        </div>

        {/* RIGHT: SHOT INSPECTOR */}
        <div className="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="p-6 border-b border-zinc-800">
            <div className="uppercase text-xs tracking-[1.5px] text-zinc-400">TECHNICAL ORCHESTRATION</div>
            <div className="text-xl font-semibold mt-1 text-white">SHOT INSPECTOR</div>
          </div>

          {!selectedShot ? (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <div className="mx-auto w-16 h-16 rounded-3xl bg-zinc-800 flex items-center justify-center mb-6">
                  <Clapperboard className="w-8 h-8 text-zinc-600" />
                </div>
                <div className="text-zinc-400">No shot selected</div>
                <div className="text-xs text-zinc-500 mt-3">Select or create a shot from the sequencer to begin LLM prompt orchestration</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto custom-scroll">
              {/* Character & Location Summary */}
              {selectedCharacter && (
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-4xl overflow-hidden border border-zinc-700">
                      {selectedCharacter.referenceImage ? (
                        <img src={selectedCharacter.referenceImage} className="object-cover w-full h-full" alt="" />
                      ) : '🧬'}
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-3xl font-semibold tracking-tighter">@{selectedCharacter.name}</div>
                        <div className="font-mono text-xs px-3 py-1 bg-amber-400/10 text-amber-400 rounded-3xl">SEED {selectedCharacter.seed}</div>
                      </div>
                      <div className="text-xs text-zinc-400">{selectedCharacter.age} yrs • {selectedCharacter.traits}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-xs text-zinc-400 leading-relaxed border-l border-l-zinc-700 pl-4">
                    {selectedCharacter.clothing}
                  </div>
                </div>
              )}

              {selectedLocation && (
                <div className="mx-6 -mt-2 bg-zinc-950 border border-zinc-700 rounded-3xl p-5 text-xs">
                  <div className="uppercase text-cyan-400 text-[10px] mb-1 tracking-widest">ENVIRONMENT</div>
                  <div className="font-medium">{selectedLocation.name}</div>
                  <div className="text-zinc-400 mt-2 leading-tight">{selectedLocation.description}</div>
                </div>
              )}

              {/* Prompt Layers + @ Tagging */}
              <div className="px-6 pt-8">
                <div className="uppercase text-xs text-zinc-400 mb-4 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> LLM PROMPT LAYERS + @MENTIONS
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">EMOTION ARC</label>
                    <input 
                      type="text" 
                      value={selectedShot.emotionArc}
                      onChange={(e) => shotsActions.updateShot(selectedShot.id, { emotionArc: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-400 rounded-2xl px-5 py-3 text-sm placeholder:text-zinc-500"
                      placeholder="from subtle smirk to outright shock"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">OPTICS + CAMERA</label>
                    <input 
                      type="text" 
                      value={selectedShot.optics}
                      onChange={(e) => shotsActions.updateShot(selectedShot.id, { optics: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-400 rounded-2xl px-5 py-3 text-sm placeholder:text-zinc-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">LIGHTING STACK</label>
                    <input 
                      type="text" 
                      value={selectedShot.lighting}
                      onChange={(e) => shotsActions.updateShot(selectedShot.id, { lighting: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-400 rounded-2xl px-5 py-3 text-sm placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                {/* @ Tagging Quick Insert */}
                <div className="mt-8">
                  <div className="text-xs text-zinc-400 mb-3 flex items-center justify-between">
                    <span>@ TAG ASSETS (inserts full sheet + LoRA)</span>
                    <span className="text-[10px] text-emerald-400">HIGGSFIELD STYLE</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {characters.slice(0, 4).map(char => (
                      <button
                        key={char.id}
                        onClick={() => {
                          const mention = `@${char.name} [seed=${char.seed} lora=${char.loraModel || 'none'} training=${char.trainingImages}] `;
                          const currentPrompt = selectedShot.fullPrompt;
                          shotsActions.updateShot(selectedShot.id, { 
                            fullPrompt: currentPrompt + (currentPrompt ? '\n\n' : '') + mention 
                          });
                        }}
                        className="px-4 py-1.5 text-xs rounded-3xl bg-zinc-800 hover:bg-violet-950 border border-violet-500/30 text-violet-300 transition-colors"
                      >
                        @{char.name}
                      </button>
                    ))}
                    {locations.slice(0, 3).map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          const mention = `@LOC:${loc.name} [time=${loc.timeOfDay} light=${loc.lighting.split(',')[0]}] `;
                          const currentPrompt = selectedShot.fullPrompt;
                          shotsActions.updateShot(selectedShot.id, { 
                            fullPrompt: currentPrompt + (currentPrompt ? '\n\n' : '') + mention 
                          });
                        }}
                        className="px-4 py-1.5 text-xs rounded-3xl bg-zinc-800 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 transition-colors"
                      >
                        @{loc.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-[10px] text-zinc-500">Click to auto-append full Soul ID, seed, LoRA weights and technical metadata to prompt payload.</div>
                </div>

                {/* Vibe Translator */}
                <div className="mt-8">
                  <div className="flex items-center gap-3">
                    <input 
                      id="vibe-input"
                      type="text" 
                      placeholder="sad cop in rain, cheap dashcam"
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-5 py-3 text-sm placeholder:text-zinc-500"
                    />
                    <button 
                      onClick={() => {
                        const vibeInput = (document.getElementById('vibe-input') as HTMLInputElement)?.value || 'vague scene';
                        const enhanced = `Wide establishing shot. ${vibeInput}. Cinematic color grading, subtle film grain, anamorphic lens flares, 35mm, 1.4 aperture, practical rain FX, volumetric god rays, moody 3200K tungsten key light with cyan rim, slow 0.4s pan left, micro expression of regret on face.`;
                        shotsActions.updateShot(selectedShot.id, { 
                          fullPrompt: enhanced,
                          emotionArc: 'quiet melancholy to resigned acceptance',
                          optics: '35mm Cooke anamorphic, slight barrel distortion,  f/1.8',
                          lighting: 'Practical tungsten key + practical neon spill, heavy rain streaks, volumetric fog'
                        });
                        const el = document.getElementById('vibe-input') as HTMLInputElement;
                        if (el) el.value = '';
                      }}
                      className="shrink-0 px-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 h-[50px] rounded-2xl text-sm font-medium hover:brightness-110"
                    >
                      ENHANCE VIBE
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-2">Claude / Google AI powered. Turns vague director notes into full technical orchestration.</div>
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="mx-6 mt-8 bg-black border border-zinc-800 rounded-3xl p-5 text-xs leading-relaxed text-emerald-200/90 font-light">
                {selectedShot.fullPrompt}
                <button 
                  onClick={() => {
                    const updatedPrompt = generatePromptForShot(selectedShot);
                    shotsActions.updateShot(selectedShot.id, { fullPrompt: updatedPrompt });
                  }}
                  className="block mt-6 text-[10px] text-violet-400 hover:text-white border border-violet-900 hover:border-violet-400 transition-colors px-6 py-2.5 rounded-2xl"
                >
                  REGENERATE WITH GOOGLE AI STUDIO
                </button>
              </div>

              {/* Takes */}
              <div className="px-6 mt-10">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm flex items-center gap-2">
                    <Film className="text-amber-400" /> TAKES
                    <span className="text-xs text-zinc-500">({selectedShot.takes.length})</span>
                  </div>
                  <button 
                    onClick={() => shotsActions.addTake(selectedShot.id)}
                    className="text-xs flex items-center gap-2 bg-amber-400 hover:bg-yellow-300 text-zinc-950 px-4 py-2 rounded-2xl font-medium"
                  >
                    <Plus className="w-3 h-3" /> NEW TAKE
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {selectedShot.takes.map((take, index) => (
                      <motion.div 
                        key={take.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`border rounded-3xl p-4 flex gap-4 cursor-pointer transition-all group ${selectedShot.selectedTakeId === take.id ? 'border-amber-400 bg-zinc-950' : 'border-zinc-800 hover:border-amber-300'}`}
                        onClick={() => {
                          shotsActions.updateShot(selectedShot.id, { selectedTakeId: take.id });
                          setSelectedTakes([take.id]);
                        }}
                      >
                        <div className="w-24 h-16 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-700 relative flex-shrink-0">
                          {take.previewUrl && <img src={take.previewUrl} alt="" className="object-cover w-full h-full" />}
                          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent flex items-center justify-center">
                            <Play className="w-6 h-6 text-white/70" />
                          </div>
                          <div className="absolute top-2 right-2 text-[10px] font-mono bg-black/70 px-1.5 rounded">T{take.number}</div>
                        </div>
                        
                        <div className="flex-1 pt-0.5">
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-amber-400">TAKE {take.number}</div>
                              <div className="text-xs text-zinc-500 mt-px">{take.createdAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                            </div>
                            
                            <div className="flex gap-px">
                              {[1,2,3,4,5].map(rating => (
                                <button 
                                  key={rating}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shotsActions.rateTake(selectedShot.id, take.id, rating);
                                  }}
                                  className={`text-lg transition-all ${take.rating >= rating ? 'text-yellow-400' : 'text-zinc-700 hover:text-zinc-400'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-zinc-400 line-clamp-3 mt-4 font-light">
                            {take.prompt.substring(0, 95)}...
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {selectedShot.takes.length > 1 && (
                  <button 
                    onClick={() => {
                      setCompareTakeIds(selectedShot.takes.map(t => t.id));
                      setShowCompareModal(true);
                    }}
                    className="mt-6 w-full h-9 text-xs border border-dashed border-white/30 hover:border-white/70 flex items-center justify-center gap-2 rounded-2xl"
                  >
                    <ImageIcon className="w-3 h-3" /> COMPARE ALL TAKES
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Frame Injection Area */}
          <div className="p-5 border-t border-zinc-800 mt-auto">
            <div className="text-xs uppercase mb-3 text-zinc-400">INIT IMAGE INJECTION</div>
            <div 
              onClick={() => {
                if (!selectedShot || !selectedCharacter) return;
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (ev) => {
                  const f = (ev.target as HTMLInputElement).files?.[0];
                  if (f && selectedCharacter) {
                    handleFileUploadForChar(selectedCharacter.id, f);
                  }
                };
                input.click();
              }}
              className="h-20 border border-dashed border-zinc-600 hover:border-white/40 rounded-3xl flex items-center justify-center text-xs flex-col cursor-pointer transition-colors"
            >
              <ImageIcon className="mb-2 w-5 h-5 text-zinc-400" />
              <span>UPLOAD LAST FRAME OR REFERENCE</span>
              <span className="text-[10px] text-zinc-500">for next shot chaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showForgeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden"
            >
              <div className="px-8 pt-8 pb-6">
                <div className="flex justify-between">
                  <div>
                    <div className="text-emerald-400 text-sm tracking-widest">NANO BANANA AI</div>
                    <div className="text-3xl font-semibold mt-1">Character Forge</div>
                  </div>
                  <button onClick={() => setShowForgeModal(false)} className="text-zinc-400">✕</button>
                </div>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <div className="text-xs mb-2 text-zinc-400">CHARACTER NAME (becomes @tag)</div>
                    <input 
                      value={newChar.name} 
                      onChange={(e) => setNewChar({...newChar, name: e.target.value.toUpperCase()})}
                      className="w-full bg-black border border-zinc-700 rounded-2xl py-4 px-6 text-2xl placeholder:text-zinc-600 focus:outline-none"
                      placeholder="KIRA"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs mb-2 text-zinc-400">AGE</div>
                      <input 
                        type="number" 
                        value={newChar.age} 
                        onChange={(e) => setNewChar({...newChar, age: parseInt(e.target.value) || 25})}
                        className="w-full bg-black border border-zinc-700 rounded-2xl py-4 px-6 text-2xl"
                      />
                    </div>
                    <div>
                      <div className="text-xs mb-2 text-zinc-400">SEED</div>
                      <div className="bg-black border border-zinc-700 rounded-2xl py-4 px-6 text-2xl font-mono flex items-center justify-between">
                        {newChar.seed}
                        <button onClick={() => setNewChar({...newChar, seed: Math.floor(Math.random() * 899999) + 100000})} className="text-xs bg-zinc-800 px-4 py-2 rounded-xl">RANDOMIZE</button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs mb-2 text-zinc-400">CORE TRAITS</div>
                    <textarea 
                      value={newChar.traits} 
                      onChange={(e) => setNewChar({...newChar, traits: e.target.value})}
                      className="w-full h-20 resize-y bg-black border border-zinc-700 rounded-3xl p-6 text-sm"
                      placeholder="Rebel hacker. Dry sense of humor. Cybernetic eyes that flicker when lying."
                    />
                  </div>
                  
                  <div>
                    <div className="text-xs mb-2 text-zinc-400">BASE CLOTHING / COSTUME</div>
                    <input 
                      value={newChar.clothing} 
                      onChange={(e) => setNewChar({...newChar, clothing: e.target.value})}
                      className="w-full bg-black border border-zinc-700 rounded-2xl py-4 px-6"
                      placeholder="Matte black tactical jacket, glowing circuit patterns"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-black p-5 flex gap-3">
                <button 
                  onClick={() => setShowForgeModal(false)}
                  className="flex-1 py-4 text-sm border border-zinc-700 rounded-2xl"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleCreateCharacter}
                  className="flex-1 py-4 text-sm bg-white text-black rounded-2xl font-medium"
                >
                  FORGE + LOCK SEED
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 w-full max-w-md rounded-3xl p-8"
            >
              <h2 className="text-2xl mb-8">Bring Your Own Keys</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-400 mb-2">GOOGLE AI STUDIO (Gemini)</div>
                  <input 
                    type="password" 
                    value={apiInput.google}
                    placeholder="AIza..."
                    onChange={(e) => setApiInput({...apiInput, google: e.target.value})}
                    className="w-full font-mono text-sm bg-zinc-950 border border-zinc-700 focus:border-white rounded-2xl px-5 py-4"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 mb-2">NANO BANANA (Image/Character)</div>
                  <input 
                    type="password" 
                    value={apiInput.nanoBanana}
                    placeholder="nb_..."
                    onChange={(e) => setApiInput({...apiInput, nanoBanana: e.target.value})}
                    className="w-full font-mono text-sm bg-zinc-950 border border-zinc-700 focus:border-white rounded-2xl px-5 py-4"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 mb-2">SEEDANCE 2.0 (Video Gen)</div>
                  <input 
                    type="password" 
                    value={apiInput.seedance}
                    placeholder="sd2_..."
                    onChange={(e) => setApiInput({...apiInput, seedance: e.target.value})}
                    className="w-full font-mono text-sm bg-zinc-950 border border-zinc-700 focus:border-white rounded-2xl px-5 py-4"
                  />
                </div>
              </div>
              
              <div className="mt-10 flex gap-3">
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-4 border border-zinc-700 rounded-2xl text-sm">CANCEL</button>
                <button 
                  onClick={() => {
                    setApiKeys(apiInput);
                    setShowSettingsModal(false);
                  }}
                  className="flex-1 py-4 bg-white text-zinc-900 rounded-2xl text-sm font-semibold"
                >
                  SAVE KEYS
                </button>
              </div>
              
              <div className="text-center text-[10px] text-zinc-500 mt-8">
                Keys are stored locally in browser only. Never shared.
              </div>
            </motion.div>
          </div>
        )}

        {showCompareModal && compareTakeIds.length > 0 && selectedShot && (
          <div className="fixed inset-0 bg-zinc-950/95 z-[210] flex items-center justify-center p-8" onClick={() => setShowCompareModal(false)}>
            <div onClick={e => e.stopPropagation()} className="max-w-6xl w-full">
              <div className="flex justify-between items-end mb-6 text-white">
                <div>
                  <div className="uppercase text-xs text-amber-400">VISUAL DIFFING TOOL</div>
                  <div className="text-5xl font-light">Take Comparison</div>
                </div>
                <button onClick={() => setShowCompareModal(false)} className="text-4xl leading-none">×</button>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                {selectedShot.takes.filter(t => compareTakeIds.includes(t.id) || compareTakeIds.length === 0).slice(0, 2).map((take, idx) => (
                  <div key={take.id} className="bg-black rounded-3xl overflow-hidden border border-zinc-700">
                    <div className="aspect-video bg-zinc-900 relative">
                      {take.previewUrl ? (
                        <img src={take.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">🎥</div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-black/70 text-xs px-4 py-1 rounded-3xl font-mono">TAKE {take.number} — {take.rating}★</div>
                    </div>
                    <div className="p-6 text-xs text-zinc-400">
                      {take.prompt.substring(0, 110)}...
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-xs text-zinc-500 mt-8">DRAG THE SLIDER TO COMPARE • PRESS ESC TO CLOSE</div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
