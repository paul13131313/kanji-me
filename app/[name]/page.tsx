import { kv } from "@vercel/kv";
import type { KanjiResult } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const result = await kv.get<KanjiResult>(`kanji:${name.toLowerCase()}`);

  if (!result) {
    return { title: "KANJI ME" };
  }

  const displayName = name.replace(/-/g, " ");

  return {
    title: `${displayName} in Kanji: ${result.kanji} | KANJI ME`,
    description: `${displayName} → ${result.kanji}. ${result.story}`,
    openGraph: {
      title: `${displayName} → ${result.kanji}`,
      description: result.story,
      type: "website",
      url: `https://kanji-me.vercel.app/${name}`,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function NamePage({ params }: PageProps) {
  const { name } = await params;
  const result = await kv.get<KanjiResult>(`kanji:${name.toLowerCase()}`);
  const displayName = name.replace(/-/g, " ");

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 gap-10"
      style={{ background: "#141314", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {result ? (
        <>
          {/* 漢字カード風の表示 */}
          <div className="text-center">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-4"
              style={{ color: "#888" }}
            >
              {displayName}
            </p>
            <p
              className="text-white leading-none mb-4"
              style={{
                fontFamily: "'Shippori Mincho B1', serif",
                fontWeight: 900,
                fontSize: `${Math.max(48, 80 - (result.kanji.length - 2) * 10)}px`,
              }}
            >
              {result.kanji}
            </p>
            <p className="text-sm text-stone-500 tracking-widest mb-2">
              {result.katakana}
            </p>
            <p className="text-[11px] italic text-stone-400">
              &ldquo;{result.story}&rdquo;
            </p>
          </div>

          {/* 漢字の意味 */}
          <div className="flex flex-col gap-4 w-full max-w-[360px]">
            {result.characters.map((char, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  className="text-3xl shrink-0"
                  style={{
                    fontFamily: "'Shippori Mincho B1', serif",
                    fontWeight: 700,
                    color: "#EEEEEE",
                  }}
                >
                  {char.kanji}
                </span>
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.1em]"
                    style={{ color: "#FD551D" }}
                  >
                    {char.meaning}
                  </span>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {char.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-lg mb-2" style={{ color: "#EEEEEE" }}>
            This name hasn&apos;t been generated yet
          </p>
          <p className="text-sm" style={{ color: "#888" }}>
            Try generating your own kanji name!
          </p>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/"
        className="py-3 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
        style={{
          background: "#FD551D",
          color: "#141314",
        }}
      >
        Get your kanji name
      </Link>

      <footer className="mt-auto pt-8">
        <p
          className="text-[10px] tracking-[0.3em] text-center uppercase"
          style={{ color: "#333" }}
        >
          Made in Japan
        </p>
      </footer>
    </main>
  );
}
