import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kanjime.vercel.app"),
  title: "KANJI ME - Your Name in Beautiful Kanji",
  description:
    "Transform your name into beautiful Japanese kanji characters with AI-powered phonetic matching. Each kanji is chosen for its beauty, meaning, and harmony.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "KANJI ME - Your Name in Beautiful Kanji",
    description:
      "Transform your name into beautiful Japanese kanji characters.",
    type: "website",
    url: "https://kanjime.vercel.app",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
