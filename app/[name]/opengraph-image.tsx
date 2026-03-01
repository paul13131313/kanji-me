import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const displayName = name.replace(/-/g, " ").toUpperCase();
  const testKanji = "蒼龍";

  // フォントサブセット取得テスト
  let fontData: ArrayBuffer | null = null;
  try {
    const encodedText = encodeURIComponent(testKanji);
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
        }}
      >
        <div style={{ fontSize: 18, color: "#FD551D", letterSpacing: "0.35em", marginBottom: 28 }}>
          {displayName}
        </div>
        <div
          style={{
            fontSize: 160,
            ...(fontData ? { fontFamily: "Shippori Mincho B1" } : {}),
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          {fontData ? testKanji : "KANJI ME"}
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
