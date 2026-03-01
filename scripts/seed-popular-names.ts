/**
 * 人気英語名100件を事前生成してVercel KVに保存するスクリプト
 *
 * 実行: npm run seed
 * 必要な環境変数: ANTHROPIC_API_KEY, KV_REST_API_URL, KV_REST_API_TOKEN
 * (.env.local から自動読み込み)
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { SYSTEM_PROMPT } from "../lib/prompt";
import { POPULAR_NAMES } from "../lib/popular-names";

async function seed() {
  const client = new Anthropic();
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Seeding ${POPULAR_NAMES.length} popular names...\n`);

  for (const name of POPULAR_NAMES) {
    // KVに既に存在するならスキップ
    try {
      const existing = await kv.get(`kanji:${name}`);
      if (existing) {
        console.log(`SKIP: ${name} (already exists)`);
        skipped++;
        continue;
      }
    } catch {
      // KV読み取り失敗は無視して続行
    }

    try {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Convert this name to kanji: ${displayName}`,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      const raw =
        message.content[0].type === "text" ? message.content[0].text : "";
      const text = raw
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "");
      const result = JSON.parse(text);

      // KVに保存（30日TTL）
      await kv.set(`kanji:${name}`, result, { ex: 60 * 60 * 24 * 30 });
      // 名前インデックスに追加
      await kv.sadd("kanji:names", name);

      processed++;
      console.log(
        `OK: ${displayName} → ${result.kanji} (${processed}/${POPULAR_NAMES.length - skipped})`
      );

      // レートリミット対策: 1秒待つ
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      failed++;
      console.error(`FAIL: ${name}`, error instanceof Error ? error.message : error);
    }
  }

  console.log(
    `\nDone: ${processed} generated, ${skipped} skipped, ${failed} failed`
  );
}

seed();
