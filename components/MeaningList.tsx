"use client";

interface Character {
  kanji: string;
  reading: string;
  meaning: string;
  description: string;
}

interface MeaningListProps {
  characters: Character[];
}

export default function MeaningList({ characters }: MeaningListProps) {
  return (
    <div className="w-full max-w-[360px] mx-auto flex flex-col gap-5">
      {characters.map((char, i) => (
        <div
          key={i}
          className="flex items-start gap-4 animate-fade-in"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <span
            className="text-4xl shrink-0"
            style={{
              fontFamily: "'Shippori Mincho B1', serif",
              fontWeight: 700,
              color: "#EEEEEE",
            }}
          >
            {char.kanji}
          </span>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: "#FD551D" }}
            >
              {char.meaning}
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
            >
              {char.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
