import React, { useState, useRef, KeyboardEvent } from 'react';
import { useStore, PromptSegment } from '../store';
import { User, MapPin, Box } from 'lucide-react';

export function SmartPromptInput({ shotId }: { shotId: string }) {
  const { shots, soulIds, environments, props, updateShotPrompt } = useStore();
  const shot = shots[shotId];
  
  const [trailingText, setTrailingText] = useState('');
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten options for command palette mapping
  const availableMentions = [
    ...Object.values(soulIds).flatMap(soul => 
      soul.variants.map(v => ({ id: v.id, type: 'variant' as const, label: `${soul.name} [${v.name}]`, desc: v.clothingDesc }))
    ),
    ...Object.values(environments).map(env => ({ id: env.id, type: 'environment' as const, label: env.name, desc: 'Location Profile' })),
    ...Object.values(props || {}).map(prop => ({ id: prop.id, type: 'prop' as const, label: prop.name, desc: prop.details }))
  ];

  const filteredMentions = availableMentions.filter(m => m.label.toLowerCase().includes(mentionQuery.toLowerCase()));

  const commitGlobalUpdate = (newSegments: PromptSegment[], appendedTrailing: string) => {
    // Generate flat raw text combined with string representations of chips for LLMs
    const fullRawText = newSegments.map(s => s.type === 'text' ? s.value : `[${s.label}]`).join('') + appendedTrailing;
    updateShotPrompt(shotId, newSegments, fullRawText);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eCoT: 
     * 1. Read trailing text input state as user types.
     * 2. Detect '@' trigger token using a robust reverse lookup.
     * 3. If triggered, isolate the query string, show palette, wait for selection.
     */
    const val = e.target.value;
    setTrailingText(val);

    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      if (lastAtIndex === 0 || val[lastAtIndex - 1] === ' ') {
        setIsMentioning(true);
        setMentionQuery(val.slice(lastAtIndex + 1));
        return;
      }
    }
    
    setIsMentioning(false);
  };

  const handleSelectMention = (mention: typeof availableMentions[0]) => {
     /* eCoT: 
     * 1. User selects a visual entity (Variant/Environment/Prop).
     * 2. Extract preceding standard text up to the '@' trigger.
     * 3. Commit the text segment and the new strongly-typed Entity chip segment directly into Zustand.
     * 4. Clear the trailing prompt and collapse to let them keep typing.
     */
    const lastAtIndex = trailingText.lastIndexOf('@');
    const textBeforeMention = lastAtIndex !== -1 ? trailingText.slice(0, lastAtIndex) : trailingText;
    
    const newSegments: PromptSegment[] = [...shot.structuredPrompt];
    if (textBeforeMention) {
      newSegments.push({ type: 'text', value: textBeforeMention });
    }
    
    newSegments.push({ type: mention.type, id: mention.id, label: mention.label });
    
    commitGlobalUpdate(newSegments, ' ');
    setTrailingText('');
    setIsMentioning(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Basic backspace logic to remove chips when text is empty
    if (e.key === 'Backspace' && trailingText === '') {
      if (shot.structuredPrompt.length > 0) {
        const remaining = [...shot.structuredPrompt];
        remaining.pop();
        commitGlobalUpdate(remaining, '');
      }
    }
  };

  return (
    <div className="relative w-full">
      <div 
        className="flex flex-wrap items-center gap-1 w-full bg-black border border-[#333] rounded px-3 py-2 focus-within:border-orange-500 transition-colors min-h-[40px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {shot.structuredPrompt.map((seg, i) => {
          if (seg.type === 'text') {
            return <span key={i} className="text-xs text-slate-300 whitespace-pre">{seg.value}</span>;
          }

          let Icon = Box;
          let colors = "bg-blue-500/20 text-blue-400 border-blue-500/50";
          
          if (seg.type === 'variant') {
            Icon = User;
            colors = 'bg-pink-500/20 text-pink-400 border-pink-500/50';
          } else if (seg.type === 'environment') {
            Icon = MapPin;
            colors = 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50';
          }

          return (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 border rounded font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${colors}`}>
              <Icon className="w-3 h-3" />
              {seg.label}
            </span>
          );
        })}
        
        <input 
          ref={inputRef}
          value={trailingText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={shot.structuredPrompt.length === 0 ? "Type @ to attach character or environment..." : ""}
          className="flex-1 min-w-[50px] bg-transparent border-none outline-none text-xs text-slate-300 placeholder:text-slate-600"
        />
      </div>

      {isMentioning && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#1A1A1A] border border-[#333] rounded shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          <div className="px-3 py-2 bg-[#121212] border-b border-[#333] text-[9px] uppercase font-bold tracking-widest text-slate-500">
            Link Context Matrix
          </div>
          {filteredMentions.length > 0 ? (
            filteredMentions.map(mention => (
              <div 
                key={mention.id}
                onClick={() => handleSelectMention(mention)}
                className="px-3 py-2 border-b border-[#222] hover:bg-[#2A2A2A] cursor-pointer"
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    {mention.type === 'variant' && <User className="w-3 h-3 text-pink-500" />}
                    {mention.type === 'environment' && <MapPin className="w-3 h-3 text-[#10b981]" />}
                    {mention.type === 'prop' && <Box className="w-3 h-3 text-blue-500" />}
                    {mention.label}
                  </span>
                  <span className={`text-[8px] uppercase tracking-wider px-1 py-0.5 rounded ${mention.type === 'variant' ? 'bg-pink-500/10 text-pink-500' : mention.type === 'environment' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-blue-500/10 text-blue-500'}`}>{mention.type}</span>
                </div>
                <div className="text-[9px] text-slate-500 mt-1 pointer-events-none">{mention.desc}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-slate-500 text-[10px]">No matches found.</div>
          )}
        </div>
      )}
    </div>
  );
}
