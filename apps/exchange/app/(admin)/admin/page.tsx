"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reports = {
  totalAuctions: number;
  totalImpressions: number;
  totalClicks: number;
  fillRate: number;
  avgCpm: number;
  totalRevenue: number;
  activeCampaigns: number;
  activePublishers: number;
  pendingPublishers: number;
  pendingCampaigns: number;
};

type AuctionRow = Record<string, unknown>;

const C = {
  accent: "#00d4aa",
  blue: "#4a9eff",
  green: "#2ecc71",
  yellow: "#ffd32a",
  orange: "#ff8c42",
  purple: "#a855f7",
  textMuted: "#5a6d82",
  textBright: "#e8f0f8",
  border: "#1a2332",
  bgCard: "#0f1419"
};

export default function AdminDashboardPage() {
  const [rep, setRep] = useState<Reports | null>(null);
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, a] = await Promise.all([
          fetch("/api/reports/dashboard", { credentials: "include" }),
          fetch("/api/auction-log?limit=20", { credentials: "include" })
        ]);
        const rj = await r.json();
        const aj = await a.json();
        if (cancelled) return;
        if (!r.ok) setErr(rj.error ?? "Reports failed");
        else setRep(rj);
        if (a.ok && Array.isArray(aj)) setAuctions(aj);
      } catch {
        if (!cancelled) setErr("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const card = (label: string, value: string, delta: string, color: string) => (
    <div
      key={label}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 16,
        borderLeft: `3px solid ${color}`
      }}
    >
      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.textBright }}>{value}</div>
      <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>{delta}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.textBright }}>Exchange Overview</div>
          <div style={{ color: C.textMuted, marginTop: 2 }}>Wired to live APIs · KPIs below</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Today", "7D", "30D", "Custom"].map((p) => (
            <button
              key={p}
              type="button"
              style={{
                background: p === "Today" ? C.accent + "18" : C.textMuted + "12",
                border: `1px solid ${p === "Today" ? C.accent + "55" : C.border}`,
                borderRadius: 6,
                color: p === "Today" ? C.accent : C.textMuted,
                padding: "7px 14px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {err && <p style={{ color: "#ff4757", fontSize: 12 }}>{err}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 12,
          marginBottom: 24
        }}
      >
        {card("Ad auctions", String(rep?.totalAuctions ?? "—"), "Live count", C.blue)}
        {card("Impressions", String(rep?.totalImpressions ?? "—"), "All time", C.accent)}
        {card("Fill rate", rep != null ? `${rep.fillRate.toFixed(1)}%` : "—", "Cleared / auctions", C.green)}
        {card("Revenue (Σ bid)", rep != null ? `$${rep.totalRevenue.toFixed(4)}` : "—", "From impressions log", C.yellow)}
        {card("Avg clearing CPM", rep != null ? `$${rep.avgCpm.toFixed(4)}` : "—", "Auction log", C.orange)}
        {card("Active campaigns", String(rep?.activeCampaigns ?? "—"), `${rep?.pendingCampaigns ?? 0} pending`, C.purple)}
        {card("Active publishers", String(rep?.activePublishers ?? "—"), `${rep?.pendingPublishers ?? 0} pending`, C.accent)}
        {card("Clicks", String(rep?.totalClicks ?? "—"), "All time", C.blue)}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.textMuted,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 12
        }}
      >
        RECENT AUCTIONS (20)
      </div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "auto" }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Auction</th>
              <th>Bids</th>
              <th>Win bid</th>
              <th>Cleared</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((row, i) => (
              <tr key={i}>
                <td style={{ fontSize: 10 }}>{String(row.created_at ?? "").slice(0, 19)}</td>
                <td style={{ fontSize: 10, fontFamily: "monospace" }}>
                  {String(row.auction_id ?? "").slice(0, 12)}…
                </td>
                <td>{String(row.bid_count ?? "")}</td>
                <td>{String(row.winning_bid ?? "—")}</td>
                <td>{row.cleared ? "✓" : "✗"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {auctions.length === 0 && (
          <p style={{ padding: 16, fontSize: 12, color: C.textMuted, margin: 0 }}>No auctions yet.</p>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.textMuted,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          margin: "24px 0 12px"
        }}
      >
        QUICK ACTIONS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {[
          ["Create Ad Unit", "▦", "Inventory", C.blue, "/admin/inventory"],
          ["Publishers", "▦", "Activate supply", C.accent, "/admin/publishers"],
          ["Demand", "⚡", "Campaigns & creatives", C.purple, "/admin/demand"],
          ["Auction Log", "◧", "Live telemetry", C.yellow, "/admin/auction-log"],
          ["Tag Generator", "⟨/⟩", "Embed code", C.accent, "/admin/tags"],
          ["Yield Rules", "△", "Floor pricing", C.green, "/admin/pricing"]
        ].map(([t, i, d, c, href]) => (
          <Link
            key={String(href)}
            href={String(href)}
            style={{
                            background: C.bgCard,
                            border: `1px solid ${String(c)}33`,
                            borderRadius: 8,
                            padding: 16,
                            textDecoration: "none",
                            display: "block",
                            transition: "border-color 0.15s"
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{String(i)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: String(c) }}>{String(t)}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{String(d)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
