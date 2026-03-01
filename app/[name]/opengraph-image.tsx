import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const displayName = name.replace(/-/g, " ").toUpperCase();

  let kanjiText = "";
  let storyText = "";

  // KVからデータ取得（動的import）
  try {
    const { kv } = await import("@vercel/kv");
    const result = await kv.get<{ kanji: string; story?: string }>(`kanji:${name.toLowerCase()}`);
    if (result) {
      kanjiText = result.kanji;
      storyText = result.story || "";
    }
  } catch {
    // KV失敗時はスキップ
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
        <div style={{ fontSize: 64, color: "#ffffff", fontWeight: 700 }}>
          {kanjiText || "KANJI ME"}
        </div>
        {storyText && (
          <div style={{ fontSize: 16, color: "#555555", marginTop: 20 }}>
            {storyText}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
