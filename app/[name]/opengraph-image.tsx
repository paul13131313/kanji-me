import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const displayName = name.replace(/-/g, " ").toUpperCase();

  // KV REST APIで直接取得（@vercel/kvモジュール不使用）
  let kanjiText = "";
  let storyText = "";
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (kvUrl && kvToken) {
      const res = await fetch(`${kvUrl}/get/kanji:${name.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await res.json();
      if (data.result) {
        const parsed = JSON.parse(data.result);
        kanjiText = parsed.kanji || "";
        storyText = parsed.story || "";
      }
    }
  } catch {
    // KV失敗
  }

  // 漢字があればフォントサブセットを取得
  let fontData: ArrayBuffer | null = null;
  if (kanjiText) {
    try {
      const encodedText = encodeURIComponent(kanjiText);
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@800&display=swap&text=${encodedText}`,
        { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
      ).then((res) => res.text());

      const match = css.match(/src: url\((.+?)\)/);
      if (match) {
        fontData = await fetch(match[1]).then((res) => res.arrayBuffer());
      }
    } catch {
      // フォント取得失敗
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          position: "relative",
        }}
      >
        {/* 上部のオレンジライン */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 60,
            right: 60,
            height: 3,
            background: "#FD551D",
          }}
        />

        <div style={{ fontSize: 18, letterSpacing: "0.35em", color: "#FD551D", marginBottom: 28, fontWeight: 600 }}>
          {displayName}
        </div>

        {kanjiText ? (
          <div
            style={{
              fontSize: 160,
              ...(fontData ? { fontFamily: "Shippori Mincho B1" } : {}),
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            {kanjiText}
          </div>
        ) : (
          <div style={{ fontSize: 64, color: "#ffffff", fontWeight: 700 }}>
            KANJI ME
          </div>
        )}

        {storyText && (
          <div style={{ fontSize: 18, color: "#555555", fontStyle: "italic", marginTop: 28 }}>
            &ldquo;{storyText}&rdquo;
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 20,
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "#333333",
            textTransform: "uppercase",
          }}
        >
          kanji-me.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Shippori Mincho B1",
                data: fontData,
                style: "normal" as const,
                weight: 800 as const,
              },
            ],
          }
        : {}),
    }
  );
}
