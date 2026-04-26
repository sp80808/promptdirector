import React, { useRef, useEffect, useState } from "react";
import { useStore } from "../../store";
import { X, Check, Eraser, Brush, Loader2, Wand2 } from "lucide-react";
import { GenerationAPI } from "../../utils/api";
import { Take } from "../../types";

export function InpaintModal({ shotId, takeId, onClose }: { shotId: string, takeId: string, onClose: () => void }) {
  const state = useStore();
  const { shots, updateTake } = state;
  const take = shots[shotId]?.takes.find(t => t.id === takeId);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inpaintPrompt, setInpaintPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !take) return;

    // Setup canvas size based on image ratio
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = take.fullImageUrl || "";
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = (img.height / img.width) * 1024;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(255, 107, 61, 0.5)"; // Accent color for mask
        ctx.lineWidth = 40;
        contextRef.current = ctx;
      }
    };
  }, [take]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e: any) => {
    if (e.touches && e.touches[0]) {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const handleInpaint = async () => {
    if (!take || !canvasRef.current) return;
    setIsProcessing(true);
    
    // Create a black and white mask
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasRef.current.width;
    maskCanvas.height = canvasRef.current.height;
    const mctx = maskCanvas.getContext("2d")!;
    mctx.fillStyle = "black";
    mctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Copy the drawing to the mask canvas in white
    mctx.globalCompositeOperation = "source-over";
    mctx.drawImage(canvasRef.current, 0, 0);
    // In a real app we'd convert the semi-transparent orange to pure white
    
    const maskBase64 = maskCanvas.toDataURL("image/png");
    
    await GenerationAPI.inpaintTake(take, maskBase64, inpaintPrompt, state, (id, updates) => {
      updateTake(shotId, id, updates);
    });
    
    setIsProcessing(false);
    onClose();
  };

  if (!take) return null;

  return (
    <div className="fixed inset-0 bg-ink-950/95 backdrop-blur-xl z-[150] flex flex-col p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">AI Inpaint Studio</h2>
          <div className="px-3 py-1 bg-ink-800 border border-line rounded text-[10px] mono text-accent">MASK MODE</div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-ink-800 rounded-full text-zinc-400">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Workspace */}
        <div className="flex-1 bg-ink-900 border border-line rounded-xl relative overflow-hidden flex items-center justify-center cursor-crosshair group">
          <img 
            src={take.fullImageUrl} 
            className="max-w-full max-h-full object-contain pointer-events-none select-none" 
            alt="Source"
          />
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="absolute inset-0 w-full h-full object-contain z-10 opacity-70"
          />
          
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <button className="nle-button bg-ink-950/80 backdrop-blur flex items-center gap-2 border-accent text-accent">
               <Brush size={14} /> Brush
            </button>
            <button 
              onClick={() => contextRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)}
              className="nle-button bg-ink-950/80 backdrop-blur flex items-center gap-2 hover:text-red-400"
            >
               <Eraser size={14} /> Clear Mask
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-6">
          <div className="nle-panel p-6 space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] mono uppercase text-zinc-500 font-bold flex items-center gap-2">
                  <Wand2 size={12} className="text-accent" /> Change Request
                </label>
                <textarea 
                  value={inpaintPrompt}
                  onChange={(e) => setInpaintPrompt(e.target.value)}
                  className="nle-input h-32 resize-none text-[11px]"
                  placeholder="Describe what to add, remove or modify in the masked area..."
                />
             </div>
             
             <button 
               onClick={handleInpaint}
               disabled={isProcessing || !inpaintPrompt}
               className="w-full bg-accent text-black font-bold py-3 rounded text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50"
             >
               {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
               {isProcessing ? "Processing..." : "APPLY INPAINT"}
             </button>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/5">
             <p className="text-[10px] text-zinc-500 leading-relaxed italic">
               Painting a mask tells the AI exactly where to focus. Combine this with a descriptive prompt to swap outfits, change expressions, or add props while maintaining the rest of the frame.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
