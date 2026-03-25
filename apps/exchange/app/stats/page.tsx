"use client";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicStats = {
  activePublishers: number;
  totalImpressions7d: number;
  avgCpm: number;
  topCategories: Array<{ name: string; icon: string }>;
};

export default function PublicExchangeStatsPage() {
  const [s, setS] = useState<PublicStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/public/stats");
        const j = (await r.json()) as PublicStats;
        if (!cancelled) {
          setS(j);
          setErr(null);
        }
      } catch {
        if (!cancelled) setErr("Could not load statistics.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <CookieConsentBanner />
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "var(--text-bright)", marginBottom: 8 }}>
        Exchange activity
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Public demand and supply snapshot from MDE Exchange (OpenRTB). Updated when you load this page.
      </p>

      {err && <p style={{ color: "#ff4757", fontSize: 13 }}>{err}</p>}

      {s && (
        <div className="card" style={{ marginBottom: 16 }}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-muted)", lineHeight: 2 }}>
            <li>
              <strong style={{ color: "var(--text-bright)" }}>{s.activePublishers}</strong> active publishers
            </li>
            <li>
              <strong style={{ color: "var(--text-bright)" }}>{s.totalImpressions7d.toLocaleString()}</strong> impressions
              (last 7 days)
            </li>
            <li>
              Blended <strong style={{ color: "var(--text-bright)" }}>${s.avgCpm.toFixed(2)}</strong> average winning bid (7d,
              before fees)
            </li>
          </ul>
          {s.topCategories?.length > 0 && (
            <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Popular content categories on the exchange:{" "}
              {s.topCategories.map((c) => `${c.icon} ${c.name}`).join(" · ")}
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
        <Link href="/demand" style={{ color: "var(--accent)" }}>
          Demand self-serve — create campaigns →
        </Link>
        <Link href="/publisher" style={{ color: "var(--accent)" }}>
          Publisher program →
        </Link>
        <Link href="/" style={{ color: "var(--text-muted)" }}>
          ← Hub
        </Link>
      </div>
    </div>
  );
}
