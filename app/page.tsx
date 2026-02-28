"use client";

import { useState, useRef, useCallback } from "react";
import NameInput from "@/components/NameInput";
import KanjiCard from "@/components/KanjiCard";
import MeaningList from "@/components/MeaningList";
import ShareButtons from "@/components/ShareButtons";

interface Character {
  kanji: string;
  reading: string;
  meaning: string;
  description: string;
}

interface KanjiResult {
  katakana: string;
  kanji: string;
  story: string;
  characters: Character[];
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getUsageCount(): number {
  try {
    const key = `kanji-me-${getTodayKey()}`;
    return parseInt(localStorage.getItem(key) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementUsage(): void {
  try {
    const key = `kanji-me-${getTodayKey()}`;
    const count = getUsageCount() + 1;
    localStorage.setItem(key, String(count));
  } catch {
    // localStorage unavailable
  }
}

const MAX_DAILY = 5;

export default function Home() {
  const [result, setResult] = useState<KanjiResult | null>(null);
  const [inputName, setInputName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (name: string) => {
    setError("");

    const usage = getUsageCount();
    if (usage >= MAX_DAILY) {
      setError("You've used all 5 tries today. Come back tomorrow!");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      incrementUsage();
      setResult(data);
      setInputName(name);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnother = useCallback(() => {
    setResult(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, []);

  const remaining =
    typeof window !== "undefined" ? MAX_DAILY - getUsageCount() : MAX_DAILY;

  return (
    <main
      className="min-h-dvh flex flex-col items-center px-4 py-12 gap-10"
      style={{ background: "#141314", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ヘッダー */}
      <div className="text-center">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "#EEEEEE" }}
        >
          KANJI ME
        </h1>
      </div>

      {/* 入力 */}
      <div className="w-full max-w-[360px]">
        <NameInput
          ref={inputRef}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {remaining < MAX_DAILY && (
          <p
            className="text-[11px] mt-2 text-center tracking-wide"
            style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {remaining} {remaining === 1 ? "try" : "tries"} left today
          </p>
        )}
      </div>

      {/* エラー */}
      {error && (
        <p className="text-sm text-center max-w-[360px]" style={{ color: "#FD551D" }}>
          {error}
        </p>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <div className="brush-loading" />
          <p
            className="text-xs tracking-wide"
            style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Writing your kanji...
          </p>
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="flex flex-col items-center gap-8 animate-fade-in w-full">
          <KanjiCard
            name={inputName}
            kanji={result.kanji}
            katakana={result.katakana}
            story={result.story}
          />
          <MeaningList characters={result.characters} />
          <ShareButtons
            name={inputName}
            kanji={result.kanji}
            onTryAnother={handleTryAnother}
          />
        </div>
      )}

      {/* フッター */}
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
