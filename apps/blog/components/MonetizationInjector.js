"use client";

import { useEffect } from "react";

/**
 * Injects the admin-configured script/HTML into #adsgupta-monetization-slot.
 * Script tags are created and appended so they execute; other HTML is set as innerHTML.
 */
export default function MonetizationInjector({ scriptHtml }) {
  useEffect(() => {
    if (!scriptHtml || typeof document === "undefined") return;
    const slot = document.getElementById("adsgupta-monetization-slot");
    if (!slot) return;
    const trimmed = scriptHtml.trim();
    const scriptMatch = trimmed.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const script = document.createElement("script");
      script.textContent = scriptMatch[1];
      slot.appendChild(script);
    } else {
      slot.innerHTML = trimmed;
    }
  }, [scriptHtml]);
  return null;
}
