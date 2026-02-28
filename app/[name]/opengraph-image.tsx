import { ImageResponse } from "next/og";
import { kv } from "@vercel/kv";
import type { KanjiResult } from "@/lib/types";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const result = await kv.get<KanjiResult>(`kanji:${name.toLowerCase()}`);

  // フォントファイル読み込み
  const fontData = await fetch(
    new URL("../../public/fonts/ShipporiMinchoB1-ExtraBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const displayName = name.replace(/-/g, " ").toUpperCase();
  const kanjiText = result?.kanji || "漢";
  const storyText = result?.story || "";

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
          background: "linear-gradient(135deg, #f5f0e8, #ede6d6)",
          position: "relative",
        }}
      >
        {/* 上部の朱色ライン */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 60,
            right: 60,
            height: 4,
            background: "#c41e3a",
            opacity: 0.6,
          }}
        />

        {/* ローマ字名 */}
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.3em",
            color: "#999",
            marginBottom: 20,
            fontFamily: "sans-serif",
          }}
        >
          {displayName}
        </div>

        {/* 漢字 */}
        <div
          style={{
            fontSize: 160,
            fontFamily: "Shippori Mincho B1",
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1,
          }}
        >
          {kanjiText}
        </div>

        {/* story */}
        {storyText && (
          <div
            style={{
              fontSize: 18,
              color: "#888",
              fontStyle: "italic",
              marginTop: 24,
              fontFamily: "sans-serif",
            }}
          >
            &ldquo;{storyText}&rdquo;
          </div>
        )}

        {/* ウォーターマーク */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            fontSize: 14,
            letterSpacing: "0.15em",
            color: "#bbb",
            fontFamily: "sans-serif",
          }}
        >
          kanjime.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Shippori Mincho B1",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    }
  );
}
