"use client";

interface KanjiCardProps {
  name: string;
  kanji: string;
  katakana: string;
  story: string;
}

// 漢字の文字数に応じてフォントサイズを計算（必ず1列に収める）
function getKanjiFontSize(length: number): number {
  if (length <= 2) return 80;
  if (length === 3) return 60;
  if (length === 4) return 50;
  return 40;
}

export default function KanjiCard({
  name,
  kanji,
  katakana,
  story,
}: KanjiCardProps) {
  return (
    <div
      id="kanji-card"
      className="relative w-full max-w-[360px] mx-auto rounded-lg overflow-hidden shadow-lg"
      style={{ aspectRatio: "3 / 4", backgroundColor: "#141314" }}
    >
      {/* 上部のオレンジライン */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px]"
        style={{ backgroundColor: "#FD551D" }}
      />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-8 px-6">
        {/* ローマ字名 */}
        <p
          className="text-xs tracking-[0.3em] uppercase font-medium"
          style={{ color: "#FD551D" }}
        >
          {name}
        </p>

        {/* 漢字（縦書き・必ず1列） */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ writingMode: "vertical-rl" }}
        >
          <p
            className="leading-none"
            style={{
              fontFamily: "'Shippori Mincho B1', serif",
              fontWeight: 900,
              fontSize: `${getKanjiFontSize(kanji.length)}px`,
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            {kanji}
          </p>
        </div>

        {/* カタカナ読み */}
        <p
          className="text-sm tracking-widest"
          style={{ color: "#FD551D" }}
        >
          {katakana}
        </p>

        {/* story（漢字の物語） */}
        <p
          className="text-[10px] italic text-center mt-2 whitespace-nowrap w-full"
          style={{ color: "#666" }}
        >
          &ldquo;{story}&rdquo;
        </p>

        {/* ウォーターマーク */}
        <p
          className="absolute bottom-2 left-0 right-0 text-[8px] tracking-[0.15em] text-center"
          style={{ color: "#444" }}
        >
          kanjime.vercel.app
        </p>
      </div>
    </div>
  );
}
