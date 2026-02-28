"use client";

import { useCallback, useState, useEffect, useRef } from "react";

interface ShareButtonsProps {
  name: string;
  kanji: string;
  story: string;
  onTryAnother: () => void;
  onTryDifferentKanji: () => void;
  isLoading: boolean;
}

// html2canvasでカード画像を生成（Blob + dataURL）
async function generateCardImage(): Promise<{ blob: Blob; dataUrl: string }> {
  const card = document.getElementById("kanji-card");
  if (!card) throw new Error("Card not found");

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(card, {
    backgroundColor: null,
    scale: 3, // 1080x1440 — Instagram Stories最適サイズ
    useCORS: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Blob generation failed"));
        resolve({
          blob,
          dataUrl: canvas.toDataURL("image/png"),
        });
      },
      "image/png"
    );
  });
}

export default function ShareButtons({
  name,
  kanji,
  story,
  onTryAnother,
  onTryDifferentKanji,
  isLoading,
}: ShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = `https://kanji-me.vercel.app/${name.toLowerCase().replace(/\s+/g, "-")}`;

  const viralText = `My name in kanji: ${kanji}\n"${story}"\n\nWhat does YOUR name look like in Japanese?`;

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!showShareMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showShareMenu]);

  // モバイル: Web Share API（画像ファイル付き）
  const handleShareMobile = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { blob } = await generateCardImage();
      const file = new File(
        [blob],
        `kanjime-${name.toLowerCase().replace(/\s+/g, "-")}.png`,
        { type: "image/png" }
      );

      const shareData: ShareData = {
        text: viralText,
        url: shareUrl,
        files: [file],
      };

      // ファイル共有をサポートしているか確認
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // ファイル非対応 → テキスト+URLだけ
        await navigator.share({
          text: viralText,
          url: shareUrl,
        });
      }
    } catch {
      // ユーザーがキャンセル
    } finally {
      setIsGenerating(false);
    }
  }, [name, kanji, story, viralText, shareUrl]);

  // Share Your Kanji ボタン
  const handleShareClick = useCallback(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      handleShareMobile();
    } else {
      setShowShareMenu((prev) => !prev);
    }
  }, [handleShareMobile]);

  // X (Twitter) Intent
  const handleShareX = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    setShowShareMenu(false);
  }, [viralText, shareUrl]);

  // Facebook Share Dialog
  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    setShowShareMenu(false);
  }, [shareUrl]);

  // Copy Link
  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
    setShowShareMenu(false);
  }, [shareUrl]);

  // Save Image（ダウンロード）
  const handleSaveImage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { dataUrl } = await generateCardImage();
      const link = document.createElement("a");
      link.download = `kanjime-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // 生成失敗
    } finally {
      setIsGenerating(false);
    }
  }, [name]);

  const buttonBase: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    padding: "12px 0",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "360px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* メインCTA: Share Your Kanji */}
      <div style={{ position: "relative" }} ref={menuRef}>
        <button
          onClick={handleShareClick}
          disabled={isGenerating}
          style={{
            ...buttonBase,
            width: "100%",
            background: "#FD551D",
            color: "#141314",
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          {isGenerating ? "Preparing..." : "Share Your Kanji"}
        </button>

        {/* デスクトップ用ドロップダウン */}
        {showShareMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "6px",
              overflow: "hidden",
              zIndex: 50,
            }}
          >
            <button
              onClick={handleShareX}
              style={{
                ...buttonBase,
                width: "100%",
                background: "transparent",
                color: "#EEEEEE",
                padding: "12px 16px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#262626")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* X icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#EEEEEE">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
            <button
              onClick={handleShareFacebook}
              style={{
                ...buttonBase,
                width: "100%",
                background: "transparent",
                color: "#EEEEEE",
                padding: "12px 16px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderTop: "1px solid #2a2a2a",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#262626")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Facebook icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#EEEEEE">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                ...buttonBase,
                width: "100%",
                background: "transparent",
                color: "#EEEEEE",
                padding: "12px 16px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderTop: "1px solid #2a2a2a",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#262626")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Link icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EEEEEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Copy Link
            </button>
          </div>
        )}
      </div>

      {/* サブ行: Save Image + Copy Link */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSaveImage}
          disabled={isGenerating}
          style={{
            ...buttonBase,
            flex: 1,
            border: "1px solid #FD551D",
            color: "#FD551D",
            background: "transparent",
            opacity: isGenerating ? 0.5 : 1,
          }}
        >
          Save Image
        </button>
        <button
          onClick={handleCopyLink}
          style={{
            ...buttonBase,
            flex: 1,
            border: "1px solid #FD551D",
            color: "#FD551D",
            background: "transparent",
          }}
        >
          Copy Link
        </button>
      </div>

      {/* Try Different Kanji */}
      <button
        onClick={onTryDifferentKanji}
        disabled={isLoading}
        style={{
          ...buttonBase,
          width: "100%",
          border: "1px solid #FD551D",
          color: isLoading ? "#666" : "#FD551D",
          background: "transparent",
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? "Generating..." : "Try Different Kanji"}
      </button>

      {/* Try another name */}
      <button
        onClick={onTryAnother}
        style={{
          ...buttonBase,
          width: "100%",
          background: "#FD551D",
          color: "#141314",
        }}
      >
        Try another name
      </button>

      {/* トースト通知 */}
      {showCopiedToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FD551D",
            color: "#141314",
            padding: "8px 20px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRadius: "4px",
            zIndex: 100,
          }}
        >
          Link copied!
        </div>
      )}
    </div>
  );
}
