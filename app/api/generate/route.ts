import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";

function getClient() {
  return new Anthropic();
}

export async function POST(request: NextRequest) {
  try {
    const { name, exclude, paidSessionId } = await request.json();

    if (!name || typeof name !== "string" || name.length > 20) {
      return NextResponse.json(
        { error: "Please enter a valid name (max 20 characters)." },
        { status: 400 }
      );
    }

    const cleaned = name.trim().replace(/[^a-zA-Z\s'-]/g, "");
    if (!cleaned) {
      return NextResponse.json(
        { error: "Please enter a name using English letters." },
        { status: 400 }
      );
    }

    // 課金セッションがある場合、残数を確認・デクリメント
    let usedPaidSession = false;
    if (paidSessionId && typeof paidSessionId === "string") {
      try {
        const paidData = await kv.get<{ remaining: number }>(`paid:${paidSessionId}`);
        if (paidData && paidData.remaining > 0) {
          await kv.set(
            `paid:${paidSessionId}`,
            { remaining: paidData.remaining - 1 },
            { ex: 60 * 60 * 24 * 7 }
          );
          usedPaidSession = true;
        }
      } catch (kvErr) {
        console.error("KV paid check error:", kvErr);
      }
    }

    // excludeリストがある場合、別の漢字を生成するよう指示
    let userContent = `Convert this name to kanji: ${cleaned}`;
    if (exclude && Array.isArray(exclude) && exclude.length > 0) {
      userContent += `\n\nIMPORTANT: Do NOT use these kanji combinations (already generated): ${exclude.join(", ")}. Choose completely different kanji characters with different meanings and imagery.`;
    }

    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    // マークダウンのコードブロックを除去
    const text = raw
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
    const result = JSON.parse(text);

    // Vercel KVに結果を保存（動的OGP用、30日キャッシュ）
    const normalizedName = cleaned.toLowerCase().replace(/\s+/g, "-");
    try {
      await kv.set(`kanji:${normalizedName}`, result, { ex: 60 * 60 * 24 * 30 });
      await kv.sadd("kanji:names", normalizedName);
    } catch (kvError) {
      console.error("KV save error (non-fatal):", kvError);
    }

    // OG画像をプリウォーム（Facebookクローラー対策：初回アクセス時にキャッシュ生成）
    try {
      const ogUrl = `https://kanji-me.vercel.app/${normalizedName}/opengraph-image`;
      fetch(ogUrl).catch(() => {}); // fire-and-forget
    } catch {
      // non-fatal
    }

    const response: Record<string, unknown> = { ...result };
    if (usedPaidSession) {
      const paidData = await kv.get<{ remaining: number }>(`paid:${paidSessionId}`);
      response.paidRemaining = paidData?.remaining ?? 0;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate kanji. Please try again." },
      { status: 500 }
    );
  }
}
