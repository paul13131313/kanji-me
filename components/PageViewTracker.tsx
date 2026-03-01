"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export default function PageViewTracker({ name }: { name: string }) {
  useEffect(() => {
    track("name_page_viewed", {
      name,
      referrer: document.referrer || "direct",
    });
  }, [name]);

  return null;
}
