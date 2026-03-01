import { kv } from "@vercel/kv";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kanji-me.vercel.app";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    const names = await kv.smembers("kanji:names");
    if (names && names.length > 0) {
      for (const name of names) {
        routes.push({
          url: `${baseUrl}/${name}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Sitemap KV error:", error);
  }

  return routes;
}
