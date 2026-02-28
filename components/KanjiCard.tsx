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
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "360px",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        aspectRatio: "3 / 4",
        backgroundColor: "#141314",
      }}
    >
      {/* 上部のオレンジライン */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "24px",
          right: "24px",
          height: "2px",
          backgroundColor: "#FD551D",
        }}
      />

      {/* コンテンツ */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          paddingTop: "32px",
          paddingBottom: "32px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {/* ローマ字名 */}
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "#FD551D",
            margin: 0,
          }}
        >
          {name}
        </p>

        {/* 漢字（縦書き・必ず1列） */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
          }}
        >
          <p
            style={{
              lineHeight: 1,
              fontFamily: "'Shippori Mincho B1', serif",
              fontWeight: 900,
              fontSize: `${getKanjiFontSize(kanji.length)}px`,
              color: "#ffffff",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            {kanji}
          </p>
        </div>

        {/* カタカナ読み */}
        <p
          style={{
            fontSize: "14px",
            letterSpacing: "0.1em",
            color: "#FD551D",
            margin: 0,
          }}
        >
          {katakana}
        </p>

        {/* story（漢字の物語） */}
        <p
          style={{
            fontSize: "10px",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: "8px",
            marginBottom: 0,
            whiteSpace: "nowrap",
            width: "100%",
            color: "#666666",
          }}
        >
          &ldquo;{story}&rdquo;
        </p>

        {/* ウォーターマーク */}
        <p
          style={{
            position: "absolute",
            bottom: "8px",
            left: 0,
            right: 0,
            fontSize: "8px",
            letterSpacing: "0.15em",
            textAlign: "center",
            color: "#444444",
            margin: 0,
          }}
        >
          kanjime.vercel.app
        </p>
      </div>
    </div>
  );
}
