import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const displayName = name.replace(/-/g, " ").toUpperCase();

  // まず最小限で動作確認（KV・フォント依存なし）
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
        <div
          style={{
            fontSize: 48,
            color: "#FD551D",
            fontWeight: 700,
          }}
        >
          KANJI ME
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#ffffff",
            marginTop: 20,
            letterSpacing: "0.2em",
          }}
        >
          {displayName}
        </div>
      </div>
    ),
    { ...size }
  );
}
