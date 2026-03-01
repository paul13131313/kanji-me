"use client";

interface KanjiCardProps {
  name: string;
  kanji: string;
  katakana: string;
  story: string;
}

// 漢字の文字数に応じてフォントサイズを計算（必ず1列に収める）
function getKanjiFontSize(length: number): number {
  if (length <= 2) return 88;
  if (length === 3) return 68;
  if (length === 4) return 54;
  return 44;
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
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "360px",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        aspectRatio: "3 / 4",
        backgroundColor: "#0A0A0A",
      }}
    >
      {/* 上部のオレンジライン */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, transparent 6%, #FD551D 6%, #FD551D 94%, transparent 94%)",
        }}
      />

      {/* コンテンツ — 完全中央配置 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 32px 100px",
        }}
      >
        {/* ローマ字名 — 上部固定 */}
        <p
          style={{
            position: "absolute",
            top: "32px",
            left: 0,
            right: 0,
            fontSize: "11px",
            letterSpacing: "0.35em",
            textIndent: "0.35em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#FD551D",
            margin: 0,
            textAlign: "center",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {name}
        </p>

        {/* 漢字（各文字を縦に積む — html2canvas互換） */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {kanji.split("").map((char, i) => (
            <span
              key={i}
              style={{
                display: "block",
                lineHeight: 1.08,
                fontFamily: "'Shippori Mincho B1', serif",
                fontWeight: 800,
                fontSize: `${getKanjiFontSize(kanji.length)}px`,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* 下部テキスト群 — 下部固定 */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {/* カタカナ読み */}
          <p
            style={{
              fontSize: "11.5px",
              letterSpacing: "0.18em",
              textIndent: "0.18em",
              color: "#FD551D",
              margin: 0,
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              textAlign: "center",
            }}
          >
            {katakana}
          </p>

          {/* story（漢字の物語） */}
          <p
            style={{
              fontSize: "9px",
              fontStyle: "italic",
              textAlign: "center",
              margin: 0,
              whiteSpace: "nowrap",
              color: "#555555",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            &ldquo;{story}&rdquo;
          </p>

          {/* ウォーターマーク */}
          <p
            style={{
              fontSize: "7px",
              letterSpacing: "0.2em",
              textAlign: "center",
              color: "#333333",
              margin: 0,
              marginTop: "4px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            kanji-me.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
}
