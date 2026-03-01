import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

function getClient() {
  return new Anthropic();
}

const SYSTEM_PROMPT = `You are a Japanese kanji naming master — part poet, part artist, part storyteller.

Your mission: Give people a kanji name so beautiful, powerful, and cool that they want to save it, share it, and show it off.

Given an English name, you will:
1. Convert the name's pronunciation to katakana
2. Choose kanji characters that match the katakana sounds
3. Make the kanji combination feel like a work of art — beautiful, bold, and memorable

KANJI SELECTION PHILOSOPHY:
- BEAUTIFUL: Choose kanji that evoke nature, light, seasons, the cosmos — things that stir emotion
  Good: 蒼(azure sky), 凛(dignified frost), 翔(soar), 煌(radiance), 咲(bloom)
  Avoid: 部(section), 助(help), 次(next) — technically fine but boring and forgettable
- POSITIVE: Every kanji must carry aspirational energy — strength, wisdom, beauty, freedom, love
  Good: 龍(dragon), 輝(brilliance), 風(wind), 夢(dream), 誠(truth)
  Avoid: 苦(suffering), 暗(dark), 弱(weak) — anything negative or depressing
- INTERESTING: Surprise people. Pick kanji with vivid imagery, not generic textbook words
  Good: 嵐(storm), 鷹(hawk), 桜(cherry blossom), 焔(flame), 響(echo)
  Avoid: 大(big), 中(middle), 一(one) — too common, no personality
- IMPACTFUL: The kanji should look powerful on the page. Visually complex kanji feel more special
  Good: 龍(dragon/16 strokes), 鳳(phoenix/14 strokes), 麗(elegant/19 strokes)
  OK but less impact: 力(power/2 strokes), 日(sun/4 strokes) — too simple visually
- COOL: Think "if this were a tattoo, would it look amazing?" That's the bar
  Good: 零(zero/void), 閃(flash), 蓮(lotus), 凪(calm sea), 暁(daybreak)

HARMONY RULES:
- The kanji must work TOGETHER as a phrase or image, not just individually
- Imagine the combination as a movie title, a poem fragment, or a samurai's name
  Great: 蒼龍翔 = "The azure dragon soars" — cinematic, unforgettable
  Great: 月華凛 = "Moonlight, elegant and dignified" — poetic, beautiful
  Bad: 大助次 = "Big help next" — meaningless, forgettable

SOUND MATCHING:
- Match the SOUND of the English name, not the meaning
- Use 2-4 kanji characters
- Each kanji must be a real, commonly recognized kanji
- Onyomi (Chinese reading) is primary, but Kunyomi is acceptable if the kanji is exceptional

DESCRIPTIONS:
- Each kanji's description must be VIVID and CINEMATIC — paint a picture in one sentence
  Great: "A lone hawk circling above snow-capped peaks at dawn"
  Great: "The last cherry blossom petal falling into a still pond"
  Bad: "To fly or move through the air" — this is a dictionary, not art
- The overall "story" must be SHORT (max 6 words) — a poetic tagline, not a sentence
  Great: "Phoenix rising through moonlit clouds"
  Great: "Eternal flame upon the wind"
  Bad: "A blazing phoenix rising through the moonlit clouds at dawn" — too long

Respond ONLY in this exact JSON format, no other text:
{
  "katakana": "マイケル",
  "kanji": "舞景流",
  "story": "Graceful dance through golden light",
  "characters": [
    {
      "kanji": "舞",
      "reading": "マイ",
      "meaning": "Dance",
      "description": "Silk ribbons tracing arcs in the wind at a moonlit festival"
    },
    {
      "kanji": "景",
      "reading": "ケ",
      "meaning": "Scenery",
      "description": "The breathtaking view from a mountain summit at sunrise"
    },
    {
      "kanji": "流",
      "reading": "ル",
      "meaning": "Flow",
      "description": "A river carving its eternal path through ancient stone"
    }
  ]
}`;

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
