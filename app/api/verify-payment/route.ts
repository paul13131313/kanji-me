import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const data = await kv.get<{ remaining: number }>(`paid:${sessionId}`);

    if (!data) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ remaining: data.remaining });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
