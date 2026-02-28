"use client";

import type { KanjiStyle } from "@/app/page";

interface StyleSelectorProps {
  value: KanjiStyle;
  onChange: (style: KanjiStyle) => void;
}

const STYLES: { key: KanjiStyle; label: string; sublabel: string }[] = [
  { key: "kaisho", label: "楷書", sublabel: "Block" },
  { key: "gyosho", label: "行書", sublabel: "Semi-cursive" },
  { key: "sosho", label: "草書", sublabel: "Cursive" },
];

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="flex gap-2 w-full max-w-[360px] mx-auto">
      {STYLES.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className="flex-1 py-2 text-center transition-colors"
          style={{
            border: value === s.key ? "1px solid #FD551D" : "1px solid #333",
            color: value === s.key ? "#FD551D" : "#666",
            background: "transparent",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
          }}
        >
          <span style={{ fontSize: "14px" }}>{s.label}</span>
          <br />
          <span style={{ fontSize: "9px", opacity: 0.6 }}>{s.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
