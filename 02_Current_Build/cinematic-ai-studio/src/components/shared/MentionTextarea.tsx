import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../../store";
import { IconUser, IconMap, IconSparkle, IconAction } from "./Icons";

export type MentionItem = {
  id: string;
  kind: "character" | "location" | "prop" | "action";
  tag: string;            // without @
  label: string;
  sub: string;
  color: string;
};

export function useAllMentions(): MentionItem[] {
  const { characters, locations, props } = useStore();
  return useMemo(() => {
    const actions: MentionItem[] = [
      { id: "a1", kind: "action", tag: "Wide", label: "Wide Shot", sub: "Establishing shot, full body and environment", color: "#b6ff5c" },
      { id: "a2", kind: "action", tag: "Medium", label: "Medium Shot", sub: "Waist-up, standard dialogue coverage", color: "#b6ff5c" },
      { id: "a3", kind: "action", tag: "CloseUp", label: "Close-Up", sub: "Shoulders-up, focusing on emotion", color: "#b6ff5c" },
      { id: "a4", kind: "action", tag: "DollyIn", label: "Dolly In", sub: "Camera moves toward subject smoothly", color: "#38e1ff" },
      { id: "a5", kind: "action", tag: "Handheld", label: "Handheld", sub: "Documentary style, organic movement", color: "#38e1ff" },
      { id: "a6", kind: "action", tag: "LowAngle", label: "Low Angle", sub: "Camera looking up, heroic/imposing", color: "#ffb347" },
      { id: "a7", kind: "action", tag: "HighAngle", label: "High Angle", sub: "Camera looking down, vulnerable", color: "#ffb347" },
    ];

    return [
      ...characters.map<MentionItem>((c) => ({
        id: c.id, kind: "character", tag: c.name,
        label: c.displayName, sub: `${c.traits.slice(0, 30)}... · seed:${c.seed}`, color: c.color,
      })),
      ...locations.map<MentionItem>((l) => ({
        id: l.id, kind: "location", tag: l.name.replace(/\s+/g, "_"),
        label: l.name, sub: `${l.timeOfDay} · ${l.description.slice(0, 40)}`, color: l.color,
      })),
      ...props.map<MentionItem>((p) => ({
        id: p.id, kind: "prop", tag: p.name,
        label: p.name, sub: p.description.slice(0, 50), color: p.color,
      })),
      ...actions,
    ];
  }, [characters, locations, props]);
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  onMentionInsert?: (item: MentionItem) => void;
};

export default function MentionTextarea({
  value, onChange, placeholder, className, rows = 3, onMentionInsert,
}: Props) {
  const items = useAllMentions();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [trigger, setTrigger] = useState<null | { from: number; query: string; rect: DOMRect | null }>(null);
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    if (!trigger) return [];
    const q = trigger.query.toLowerCase();
    return items
      .filter((i) => i.tag.toLowerCase().includes(q) || i.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [items, trigger]);

  useEffect(() => { setActive(0); }, [trigger?.query]);

  const detectTrigger = (el: HTMLTextAreaElement) => {
    const cursor = el.selectionStart;
    const text = el.value.slice(0, cursor);
    const m = text.match(/(^|\s)@([\w-]*)$/);
    if (!m) { setTrigger(null); return; }
    const from = cursor - m[2].length - 1;
    setTrigger({ from, query: m[2], rect: el.getBoundingClientRect() });
  };

  const insert = (item: MentionItem) => {
    const el = ref.current; if (!el) return;
    const cursor = el.selectionStart;
    const before = value.slice(0, trigger?.from ?? cursor);
    const after = value.slice(cursor);
    const insertion = `@${item.tag} `;
    const next = before + insertion + after;
    onChange(next);
    setTrigger(null);
    onMentionInsert?.(item);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + insertion).length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!trigger || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insert(filtered[active]); }
    else if (e.key === "Escape") { setTrigger(null); }
  };

  const highlighted = useMemo(() => renderHighlight(value, items), [value, items]);

  return (
    <div className={`relative ${className || ""}`}>
      <div
        aria-hidden
        className="absolute inset-0 px-2 py-1.5 mono text-[12px] whitespace-pre-wrap break-words pointer-events-none text-transparent"
        style={{ font: "inherit" }}
      >
        {highlighted}
      </div>
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); detectTrigger(e.target); }}
        onKeyDown={onKey}
        onClick={(e) => detectTrigger(e.currentTarget)}
        onBlur={() => setTimeout(() => setTrigger(null), 120)}
        className="relative w-full bg-black/40 border border-white/10 rounded-md px-2.5 py-2 text-[12px] text-zinc-200 outline-none focus:border-orange-500/50 resize-y caret-orange-500 transition-colors"
        style={{ minHeight: rows * 22 }}
      />

      {trigger && filtered.length > 0 && (
        <MentionMenu
          items={filtered}
          active={active}
          onPick={insert}
          onHover={setActive}
          query={trigger.query}
        />
      )}
    </div>
  );
}

function MentionMenu({
  items, active, onPick, onHover, query,
}: {
  items: MentionItem[]; active: number; query: string;
  onPick: (i: MentionItem) => void; onHover: (n: number) => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-1 z-50 w-[320px] bg-[#121212] border border-white/10 rounded-lg shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="px-3 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <span className="text-[10px] mono uppercase tracking-widest text-orange-500 font-bold">@ Cinematic Context</span>
        <span className="text-[9px] mono text-zinc-500">
          {query ? `"${query}"` : "type to filter"} · ↑↓ ⏎
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {items.map((it, i) => (
          <button
            key={`${it.kind}-${it.id}`}
            onMouseDown={(e) => { e.preventDefault(); onPick(it); }}
            onMouseEnter={() => onHover(i)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all ${
              i === active ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 shadow-inner"
              style={{ background: `${it.color}22`, border: `1px solid ${it.color}44` }}
            >
              <div style={{ color: it.color }}>
                {it.kind === "character" ? <IconUser /> : it.kind === "location" ? <IconMap /> : it.kind === "action" ? <IconAction /> : <IconSparkle />}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="mono text-[13px] font-bold tracking-tight" style={{ color: it.color }}>@{it.tag}</span>
                <span className="text-[8px] mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-zinc-500 border border-white/5">{it.kind}</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">{it.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function renderHighlight(text: string, items: MentionItem[]) {
  const tagSet = new Set(items.map((i) => i.tag.toLowerCase()));
  const colorMap: Record<string, string> = Object.fromEntries(items.map((i) => [i.tag.toLowerCase(), i.color]));
  const parts: React.ReactNode[] = [];
  const re = /(@[\w-]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const tag = m[1].slice(1).toLowerCase();
    const known = tagSet.has(tag);
    parts.push(
      <span
        key={key++}
        style={{
          color: known ? colorMap[tag] : "#71757f",
          background: known ? `${colorMap[tag]}22` : "transparent",
          borderRadius: 4, padding: "0 2px",
          border: known ? `1px solid ${colorMap[tag]}44` : "none"
        }}
      >
        {m[1]}
      </span>
    );
    last = m.index + m[1].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  parts.push("\u200b");
  return parts;
}
