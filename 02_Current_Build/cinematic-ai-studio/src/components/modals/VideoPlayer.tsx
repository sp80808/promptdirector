import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import { X, Play, Pause, SkipBack, SkipForward, Maximize, Volume2, Film } from "lucide-react";

export function VideoPlayer() {
  const { scenes, shots, setModal } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  // Flatten sequence of approved takes
  const sequence = React.useMemo(() => {
    const list: { id: string, title: string, mediaUrl: string, audioUrl?: string, isVideo: boolean }[] = [];
    scenes.forEach(scene => {
      scene.shotIds.forEach(shotId => {
        const shot = shots[shotId];
        if (shot && shot.approvedTakeId) {
          const take = shot.takes.find(t => t.id === shot.approvedTakeId);
          if (take) {
            list.push({
              id: shot.id,
              title: shot.title,
              mediaUrl: take.videoUrl || take.fullImageUrl || take.thumbUrl || "",
              audioUrl: take.audioUrl,
              isVideo: !!take.videoUrl
            });
          }
        }
      });
    });
    return list;
  }, [scenes, shots]);

  const currentMedia = sequence[currentShotIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Audio Sync Effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio Play Error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentShotIndex, volume]);

  // Fallback for static images: display them for 3 seconds each
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentMedia && !currentMedia.isVideo) {
      timer = setTimeout(() => {
        if (currentShotIndex < sequence.length - 1) {
          setCurrentShotIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentShotIndex(0);
        }
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentShotIndex, currentMedia, sequence.length]);

  const handleVideoEnded = () => {
    if (currentShotIndex < sequence.length - 1) {
      setCurrentShotIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentShotIndex(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (!isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  if (sequence.length === 0) {
    return (
      <div className="fixed inset-0 bg-ink-950/95 backdrop-blur-md z-[100] flex items-center justify-center">
        <div className="nle-panel p-8 max-w-md w-full text-center space-y-4">
          <Film size={48} className="mx-auto text-zinc-600" />
          <h2 className="text-xl font-bold text-white">No Approved Takes</h2>
          <p className="text-xs text-zinc-400">Sequence empty. Approve takes in the Inspector to build your timeline.</p>
          <button onClick={() => setModal(null)} className="nle-button bg-accent text-black font-bold w-full mt-4 border-none">
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-10 transition-opacity">
         <div className="flex items-center gap-4">
           <h2 className="text-sm font-bold text-white tracking-widest uppercase">Director's Cut</h2>
           <span className="text-[10px] mono text-accent px-2 py-0.5 rounded bg-accent/20">Playing: {currentMedia?.title || 'Unknown'}</span>
         </div>
         <button onClick={() => setModal(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
           <X size={24} />
         </button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black relative">
        {currentMedia ? (
          <>
            {currentMedia.audioUrl && (
              <audio key={currentMedia.audioUrl} ref={audioRef} src={currentMedia.audioUrl} loop />
            )}
            {currentMedia.isVideo ? (
              <video 
                ref={videoRef}
                src={currentMedia.mediaUrl} 
                autoPlay={isPlaying}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={currentMedia.mediaUrl} 
                alt={currentMedia.title}
                className="w-full h-full object-contain"
              />
            )}
          </>
        ) : null}
      </div>

      <div className="h-24 bg-gradient-to-t from-black to-transparent px-8 flex flex-col justify-end pb-6 absolute bottom-0 left-0 right-0">
         <div className="flex items-center justify-between gap-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4 text-white">
              <button 
                onClick={() => setCurrentShotIndex(Math.max(0, currentShotIndex - 1))}
                className="hover:text-accent transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button 
                onClick={() => setCurrentShotIndex(Math.min(sequence.length - 1, currentShotIndex + 1))}
                className="hover:text-accent transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center gap-2">
               {sequence.map((item, idx) => (
                 <div 
                   key={idx} 
                   className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${idx === currentShotIndex ? 'bg-accent' : idx < currentShotIndex ? 'bg-white/50' : 'bg-white/20 hover:bg-white/40'}`}
                   onClick={() => {
                     setCurrentShotIndex(idx);
                     setIsPlaying(true);
                   }}
                 />
               ))}
            </div>

            <div className="flex items-center gap-4 text-white">
              <button className="hover:text-accent transition-colors" onClick={() => setVolume(v => v === 0 ? 0.7 : 0)}>
                {volume === 0 ? <Volume2 size={20} className="text-zinc-600" /> : <Volume2 size={20} />}
              </button>
              <button className="hover:text-accent transition-colors"><Maximize size={20} /></button>
            </div>
         </div>
      </div>
    </div>
  );
}
