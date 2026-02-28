import { NextRequest, NextResponse } from "next/server";

const rateMap = new Map<string, number[]>();

// 古いエントリを定期的にクリーンアップ
function cleanup() {
  const now = Date.now();
  for (const [key, timestamps] of rateMap) {
    const recent = timestamps.filter((t) => now - t < 60_000);
    if (recent.length === 0) {
      rateMap.delete(key);
    } else {
      rateMap.set(key, recent);
    }
  }
}

setInterval(cleanup, 60_000);

export function middleware(request: NextRequest) {
  // /api/generate のみrate limit対象
  if (!request.nextUrl.pathname.startsWith("/api/generate")) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const timestamps = rateMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < 60_000);

  if (recent.length >= 3) {
    return NextResponse.json(
      { error: "Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  recent.push(now);
  rateMap.set(ip, recent);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
