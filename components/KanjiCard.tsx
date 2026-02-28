"use client";

interface KanjiCardProps {
  name: string;
  kanji: string;
  katakana: string;
  story: string;
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
      style={{ aspectRatio: "3 / 4" }}
    >
      {/* 和紙テクスチャ背景 */}
      <div className="absolute inset-0 washi-bg" />

      {/* 上部の朱色ライン */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px]"
        style={{ backgroundColor: "#c41e3a", opacity: 0.6 }}
      />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-8 px-6">
        {/* ローマ字名 */}
        <p
          className="text-xs tracking-[0.3em] uppercase font-medium"
          style={{ color: "#a8a29e" }}
        >
          {name}
        </p>

        {/* 漢字（縦書き） */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ writingMode: "vertical-rl" }}
        >
          <p
            className="leading-none"
            style={{
              fontFamily: "'Shippori Mincho B1', serif",
              fontWeight: 900,
              fontSize: `${Math.max(48, 80 - (kanji.length - 2) * 10)}px`,
              color: "#ffffff",
            }}
          >
            {kanji}
          </p>
        </div>

        {/* カタカナ読み */}
        <p
          className="text-sm tracking-widest"
          style={{ color: "#78716c" }}
        >
          {katakana}
        </p>

        {/* story（漢字の物語） */}
        <p
          className="text-[10px] italic text-center mt-2 whitespace-nowrap w-full"
          style={{ color: "#a8a29e" }}
        >
          &ldquo;{story}&rdquo;
        </p>

        {/* ウォーターマーク */}
        <p
          className="absolute bottom-2 left-0 right-0 text-[8px] tracking-[0.15em] text-center"
          style={{ color: "#d6d3d1", opacity: 0.4 }}
        >
          kanjime.vercel.app
        </p>
      </div>
    </div>
  );
}
