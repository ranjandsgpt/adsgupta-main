"use client";

import { useEffect, useState } from "react";

type PubStats = {
  activePublishers: number;
  totalImpressions7d: number;
  avgCpm: number;
  topCategories: Array<{ name: string; icon: string }>;
};

export function DemandLandingStats() {
  const [s, setS] = useState<PubStats | null>(null);

  useEffect(() => {
    void fetch("/api/public/stats")
      .then((r) => r.json())
      .then((j) => setS(j as PubStats))
      .catch(() => setS(null));
  }, []);

  if (!s) return null;

  const monthlyImpM = (s.totalImpressions7d / 7) * 30 / 1_000_000;

  return (
    <div
      className="portal-card"
      style={{
        padding: 20,
        marginBottom: 28,
        borderColor: "#00d4aa44",
        background: "linear-gradient(145deg, rgba(0,212,170,0.08), transparent)"
      }}
    >
      <div style={{ fontSize: 11, color: "#00d4aa", fontWeight: 800, marginBottom: 8, letterSpacing: "0.06em" }}>
        LIVE EXCHANGE REACH
      </div>
      <p style={{ margin: 0, fontSize: 15, color: "var(--text-bright)", lineHeight: 1.55 }}>
        Reach <strong style={{ color: "#00d4aa" }}>{s.activePublishers}</strong> active publishers ·{" "}
        <strong style={{ color: "#00d4aa" }}>{monthlyImpM.toFixed(1)}M</strong> modeled monthly impressions (from 7d
        pace) · blended eCPM <strong>${s.avgCpm.toFixed(2)}</strong>
      </p>
      {s.topCategories?.length > 0 && (
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          Top categories: {s.topCategories.slice(0, 3).map((c) => `${c.icon} ${c.name}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
