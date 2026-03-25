"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mde_consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ necessary: true, ts: Date.now() }));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "12px 16px",
          background: "linear-gradient(180deg, #f8f9fa 0%, #f1f3f5 100%)",
          borderTop: "1px solid var(--border, #e2e8f0)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.35)",
        fontSize: 12,
          color: "var(--text-muted, #718096)",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <p style={{ margin: 0, maxWidth: 720, lineHeight: 1.5 }}>
        We use necessary cookies and local storage for session and consent preferences. No ad tracking cookies are set
        without your choice. See our{" "}
        <Link href="/privacy" style={{ color: "var(--accent, #0066cc)" }}>
          Privacy Policy
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={accept}>
          Accept necessary
        </button>
      </div>
    </div>
  );
}
