"use client";

import { useCallback } from "react";

interface ShareButtonsProps {
  name: string;
  kanji: string;
  onTryAnother: () => void;
  onTryDifferentKanji: () => void;
  isLoading: boolean;
}

export default function ShareButtons({
  name,
  kanji,
  onTryAnother,
  onTryDifferentKanji,
  isLoading,
}: ShareButtonsProps) {
  const handleSaveImage = useCallback(async () => {
    const card = document.getElementById("kanji-card");
    if (!card) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `kanjime-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [name]);

  const shareUrl = `https://kanji-me.vercel.app/${name.toLowerCase().replace(/\s+/g, "-")}`;

  const handleShare = useCallback(async () => {
    const text = `My name in Kanji: ${kanji} (${name})`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "KANJI ME", text, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed
      }
    }

    await navigator.clipboard.writeText(`${text} — ${shareUrl}`);
    alert("Copied to clipboard!");
  }, [name, kanji, shareUrl]);

  return (
    <div
      className="w-full max-w-[360px] mx-auto flex flex-col gap-3"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="flex gap-3">
        <button
          onClick={handleSaveImage}
          className="flex-1 py-3 text-xs font-semibold uppercase tracking-[0.12em]
                     transition-colors"
          style={{
            border: "1px solid #333",
            color: "#EEEEEE",
            background: "transparent",
          }}
        >
          Save Image
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-3 text-xs font-semibold uppercase tracking-[0.12em]
                     transition-colors"
          style={{
            border: "1px solid #FD551D",
            color: "#FD551D",
            background: "transparent",
          }}
        >
          Share
        </button>
      </div>
      <button
        onClick={onTryDifferentKanji}
        disabled={isLoading}
        className="w-full py-3 text-xs font-semibold uppercase tracking-[0.15em]
                   transition-colors"
        style={{
          border: "1px solid #FD551D",
          color: isLoading ? "#666" : "#FD551D",
          background: "transparent",
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? "Generating..." : "Try Different Kanji"}
      </button>
      <button
        onClick={onTryAnother}
        className="w-full py-3 text-xs font-semibold uppercase tracking-[0.15em]
                   transition-colors"
        style={{
          background: "#FD551D",
          color: "#141314",
        }}
      >
        Try another name
      </button>
    </div>
  );
}
