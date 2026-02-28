"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const [previousKanji, setPreviousKanji] = useState<string[]>([]);
  const [paidSessionId, setPaidSessionId] = useState<string | null>(null);
  const [paidRemaining, setPaidRemaining] = useState(0);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stripe支払い後のリダイレクト処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      // URLからsession_idを除去
      window.history.replaceState({}, "", "/");
      // 支払い検証（リトライ付き）
      const verify = async (retries: number) => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) {
            const data = await res.json();
            setPaidSessionId(sessionId);
            setPaidRemaining(data.remaining);
            setShowLimitReached(false);
            setError("");
            localStorage.setItem("kanji-me-paid-session", sessionId);
          } else if (retries > 0) {
            setTimeout(() => verify(retries - 1), 2000);
          }
        } catch {
          if (retries > 0) setTimeout(() => verify(retries - 1), 2000);
        }
      };
      verify(3);
    } else {
      // localStorageから既存のセッションを復元
      const saved = localStorage.getItem("kanji-me-paid-session");
      if (saved) {
        setPaidSessionId(saved);
        fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: saved }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.remaining > 0) {
              setPaidRemaining(data.remaining);
            } else {
              localStorage.removeItem("kanji-me-paid-session");
              setPaidSessionId(null);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // 生成可能かチェック（無料枠 or 課金枠）
  const canGenerate = () => {
    const freeUsage = getUsageCount();
    if (freeUsage < MAX_DAILY) return true;
    if (paidSessionId && paidRemaining > 0) return true;
    return false;
  };

  const handleGenerate = async (name: string, exclude?: string[]) => {
    setError("");
    setShowLimitReached(false);

    if (!canGenerate()) {
      setShowLimitReached(true);
      return;
    }

    setIsLoading(true);
    if (!exclude) {
      setResult(null);
      setPreviousKanji([]);
    }

    try {
      const freeUsage = getUsageCount();
      const usePaid = freeUsage >= MAX_DAILY && paidSessionId;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          exclude,
          paidSessionId: usePaid ? paidSessionId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // 無料枠を使った場合はlocalStorageをインクリメント
      if (!usePaid) {
        incrementUsage();
      } else if (data.paidRemaining !== undefined) {
        setPaidRemaining(data.paidRemaining);
        if (data.paidRemaining <= 0) {
          localStorage.removeItem("kanji-me-paid-session");
          setPaidSessionId(null);
        }
      }

      setResult(data);
      setInputName(name);
      setPreviousKanji((prev) => (exclude ? [...prev, data.kanji] : [data.kanji]));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (name: string) => {
    await handleGenerate(name);
  };

  const handleTryDifferentKanji = useCallback(async () => {
    if (!inputName) return;
    await handleGenerate(inputName, previousKanji);
  }, [inputName, previousKanji, paidSessionId, paidRemaining]);

  const handleTryAnother = useCallback(() => {
    setResult(null);
    setError("");
    setPreviousKanji([]);
    setShowLimitReached(false);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, []);

  const handleBuyMore = async () => {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    }
  };

  const freeRemaining =
    typeof window !== "undefined" ? MAX_DAILY - getUsageCount() : MAX_DAILY;
  const totalRemaining = freeRemaining + (paidSessionId ? paidRemaining : 0);

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
        {freeRemaining < MAX_DAILY && (
          <p
            className="text-[11px] mt-2 text-center tracking-wide"
            style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {totalRemaining > 0
              ? `${totalRemaining} ${totalRemaining === 1 ? "try" : "tries"} left${paidRemaining > 0 ? ` (${paidRemaining} paid)` : " today"}`
              : "No tries left"}
          </p>
        )}
      </div>

      {/* エラー */}
      {error && (
        <p className="text-sm text-center max-w-[360px]" style={{ color: "#FD551D" }}>
          {error}
        </p>
      )}

      {/* 制限到達 → 課金導線 */}
      {showLimitReached && (
        <div className="flex flex-col items-center gap-3 max-w-[360px]">
          <p className="text-sm text-center" style={{ color: "#EEEEEE" }}>
            You&apos;ve used all free tries today
          </p>
          <button
            onClick={handleBuyMore}
            className="py-3 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{
              background: "#FD551D",
              color: "#141314",
            }}
          >
            Get 5 more tries — ¥100
          </button>
          <p
            className="text-[10px] text-center"
            style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}
          >
            or come back tomorrow for 5 free tries
          </p>
        </div>
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
            onTryDifferentKanji={handleTryDifferentKanji}
            isLoading={isLoading}
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
