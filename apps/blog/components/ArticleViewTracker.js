"use client";

import { useEffect, useRef } from "react";

export default function ArticleViewTracker({ slug }) {
  const sent = useRef(false);
  useEffect(() => {
    if (!slug || sent.current) return;
    sent.current = true;
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, event_type: "view" }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
