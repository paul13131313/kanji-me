import { ImageResponse } from "next/og";
import { kv } from "@vercel/kv";
import type { KanjiResult } from "@/lib/types";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Facebookクローラーのタイムアウト対策：キャッシュを効かせる
export const revalidate = 86400; // 24時間キャッシュ

// フォントをモジュールレベルでキャッシュ（コールドスタート時に1回だけフェッチ）
let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache;
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@800&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
    ).then((res) => res.text());

    const match = css.match(/src: url\((.+?)\)/);
    if (!match) return null;

    fontCache = await fetch(match[1]).then((res) => res.arrayBuffer());
    return fontCache;
  } catch {
    return null;
  }
}

// エラー時のフォールバック画像（外部フェッチ不要）
function fallbackImage(displayName: string) {
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

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const displayName = name.replace(/-/g, " ").toUpperCase();

  try {
    // フォントとKVデータを並列フェッチ
    const [fontData, result] = await Promise.all([
      loadFont(),
      kv.get<KanjiResult>(`kanji:${name.toLowerCase()}`).catch(() => null),
    ]);

    const kanjiText = result?.kanji || "漢";
    const storyText = result?.story || "";

    // フォントが取得できない場合はフォールバック
    if (!fontData) {
      return fallbackImage(displayName);
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

          {/* ローマ字名 */}
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.35em",
              color: "#FD551D",
              marginBottom: 28,
              fontFamily: "sans-serif",
              fontWeight: 600,
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
              color: "#ffffff",
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
                color: "#555555",
                fontStyle: "italic",
                marginTop: 28,
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
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "#333333",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
            }}
          >
            kanji-me.vercel.app
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Shippori Mincho B1",
            data: fontData,
            style: "normal" as const,
            weight: 800 as const,
          },
        ],
      }
    );
  } catch {
    // 何かエラーが起きてもフォールバック画像を返す（空レスポンス防止）
    return fallbackImage(displayName);
  }
}
