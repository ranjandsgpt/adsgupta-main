"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const C = {
  bg: "#0a0e17",
  bgCard: "#0f1419",
  border: "#1a2332",
  textMuted: "#5a6d82",
  textBright: "#e8f0f8",
  accent: "#00d4aa",
  blue: "#4a9eff",
  green: "#2ecc71",
  yellow: "#ffd32a",
  orange: "#ff8c42",
  purple: "#a855f7",
  red: "#ff4757"
};

type Dash = {
  auctionsToday: number;
  auctionsDeltaPct: number;
  impressionsToday: number;
  impressionsDeltaPct: number;
  fillRateToday: number;
  fillRateDeltaPp: number;
  revenueToday: number;
  revenueDeltaPct: number;
  avgCpmToday: number;
  avgCpmDeltaPct: number;
  activePublishers: number;
  activeCampaigns: number;
  pendingReviewTotal: number;
  ivtAuctionsToday?: number;
  ivtRateToday?: number;
};

type AuctionRow = Record<string, unknown>;

type DpRow = {
  campaign_id: string;
  campaign_name: string;
  advertiser_name: string;
  wins: number;
  sum_bid_count: number;
  avg_bid_count: number;
  revenue: number;
  impressions_today: number;
  win_rate_pct: number;
  bid_share_pct: number;
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function fmtDeltaPct(pct: number): { text: string; pos: boolean } {
  const pos = pct >= 0;
  return { text: `${pos ? "+" : ""}${pct.toFixed(1)}% vs prev`, pos };
}

function fmtDeltaPp(pp: number): { text: string; pos: boolean } {
  const pos = pp >= 0;
  return { text: `${pos ? "+" : ""}${pp.toFixed(1)}pp vs prev`, pos };
}

function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminDashboardPage() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [demand, setDemand] = useState<{ rows: DpRow[]; total_auctions_today: number } | null>(null);
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [r, d, a] = await Promise.all([
        fetch("/api/reports/dashboard", { credentials: "include" }),
        fetch("/api/demand-performance", { credentials: "include" }),
        fetch("/api/auction-log?limit=10&preset=today", { credentials: "include" })
      ]);
      const rj = await r.json();
      const dj = await d.json();
      const aj = await a.json();
      if (!r.ok) setErr(rj.error ?? "Reports failed");
      else {
        setErr(null);
        setDash(rj);
      }
      if (d.ok && dj.rows) setDemand(dj);
      else if (!d.ok) setDemand(null);
      if (a.ok && Array.isArray(aj)) setAuctions(aj);
    } catch {
      setErr("Network error");
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const card = (
    label: string,
    value: string,
    delta: { text: string; pos: boolean },
    color: string,
    alert?: boolean
  ) => (
    <div
      key={label}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 16,
        borderLeft: `3px solid ${alert ? C.red : color}`
      }}
    >
      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: alert ? C.red : C.textBright }}>{value}</div>
      <div style={{ fontSize: 10, color: delta.pos ? C.green : C.red, marginTop: 4 }}>{delta.text}</div>
    </div>
  );

  const d = dash;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.textBright }}>Exchange Overview</div>
          <div style={{ color: C.textMuted, marginTop: 2 }}>Real-time performance · Today vs yesterday · Refreshes every 30s</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Today", "7D", "30D", "Custom"].map((p) => (
            <button
              key={p}
              type="button"
              disabled={p !== "Today"}
              style={{
                background: p === "Today" ? C.accent + "18" : C.textMuted + "12",
                border: `1px solid ${p === "Today" ? C.accent + "55" : C.border}`,
                borderRadius: 6,
                color: p === "Today" ? C.accent : C.textMuted,
                padding: "7px 14px",
                fontSize: 11,
                fontWeight: 700,
                cursor: p === "Today" ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                opacity: p === "Today" ? 1 : 0.6
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.textMuted, margin: "-8px 0 20px" }}>
        Live auction IDs and clearing prices scroll in the <strong style={{ color: C.textBright }}>admin header</strong> (SSE).
      </p>

      {err && <p style={{ color: C.red, fontSize: 12 }}>{err}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 12,
          marginBottom: 24
        }}
      >
        {d &&
          [
            card("Total Auctions", fmtCompact(d.auctionsToday), fmtDeltaPct(d.auctionsDeltaPct), C.blue),
            card("Total Impressions", fmtCompact(d.impressionsToday), fmtDeltaPct(d.impressionsDeltaPct), C.accent),
            card("Fill Rate %", `${d.fillRateToday.toFixed(1)}%`, fmtDeltaPp(d.fillRateDeltaPp), C.green),
            card("Total Revenue $", `$${d.revenueToday.toFixed(2)}`, fmtDeltaPct(d.revenueDeltaPct), C.yellow),
            card("Avg eCPM $", `$${d.avgCpmToday.toFixed(4)}`, fmtDeltaPct(d.avgCpmDeltaPct), C.orange),
            card("Active Publishers", String(d.activePublishers), { text: "—", pos: true }, C.purple),
            card("Active Campaigns", String(d.activeCampaigns), { text: "—", pos: true }, C.accent),
            card(
              "Pending Review",
              String(d.pendingReviewTotal),
              { text: "publishers + campaigns", pos: d.pendingReviewTotal === 0 },
              C.red,
              d.pendingReviewTotal > 0
            )
          ]}
        {!d && !err && <div style={{ color: C.textMuted, fontSize: 12 }}>Loading KPIs…</div>}
      </div>
      {d != null && d.ivtRateToday != null && d.ivtRateToday > 0 && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: -16, marginBottom: 20 }}>
          IVT share today: <span style={{ color: d.ivtRateToday > 10 ? C.red : C.textBright }}>{d.ivtRateToday.toFixed(1)}%</span>
        </div>
      )}

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
        DEMAND SOURCE PERFORMANCE
      </div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20, overflow: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: 8,
            padding: "8px 12px",
            borderBottom: `1px solid ${C.border}`,
            fontSize: 10,
            fontWeight: 700,
            color: C.textMuted,
            minWidth: 640
          }}
        >
          <div>PARTNER</div>
          <div>REQUESTS</div>
          <div>BIDS</div>
          <div>BID RATE</div>
          <div>WIN RATE</div>
          <div>REVENUE</div>
        </div>
        {(demand?.rows ?? []).map((row) => (
          <div
            key={row.campaign_id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              gap: 8,
              padding: "10px 12px",
              borderBottom: `1px solid ${C.border}08`,
              alignItems: "center",
              fontSize: 11,
              minWidth: 640
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: C.textBright }}>{row.campaign_name}</div>
              <div style={{ fontSize: 9, color: C.textMuted }}>{row.advertiser_name}</div>
            </div>
            <div style={{ color: C.textBright }} title="Cleared auctions attributed to this campaign">
              {row.wins}
            </div>
            <div style={{ color: C.textBright }}>{Math.round(row.sum_bid_count)}</div>
            <div style={{ color: C.green }}>{row.bid_share_pct.toFixed(1)}%</div>
            <div style={{ color: C.orange }}>{row.win_rate_pct.toFixed(1)}%</div>
            <div style={{ fontWeight: 700, color: C.yellow }}>${row.revenue.toFixed(2)}</div>
          </div>
        ))}
        {(!demand?.rows?.length || demand.rows.length === 0) && (
          <p style={{ padding: 16, fontSize: 12, color: C.textMuted, margin: 0 }}>No campaign wins today yet.</p>
        )}
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
        RECENT AUCTIONS (10)
      </div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "auto", marginBottom: 24 }}>
        <table className="table" style={{ margin: 0, minWidth: 900 }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Auction ID</th>
              <th>Publisher</th>
              <th>Unit</th>
              <th>Page URL</th>
              <th>Bids</th>
              <th>Win bid</th>
              <th>Floor</th>
              <th>Cleared</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((row, i) => {
              const wb = Number(row.winning_bid);
              const bidCol =
                Number.isFinite(wb) && wb > 2 ? C.green : Number.isFinite(wb) && wb >= 0.5 ? C.orange : C.textMuted;
              return (
                <tr key={i}>
                  <td style={{ fontSize: 10, whiteSpace: "nowrap" }} title={String(row.created_at ?? "")}>
                    {relTime(String(row.created_at ?? ""))}
                  </td>
                  <td style={{ fontFamily: "ui-monospace,monospace", fontSize: 10 }}>
                    {String(row.auction_id ?? "").slice(0, 8)}
                  </td>
                  <td style={{ fontSize: 10 }}>{String(row.publisher_domain ?? "—")}</td>
                  <td style={{ fontSize: 10 }}>{String(row.ad_unit_name ?? "—")}</td>
                  <td
                    style={{ fontSize: 9, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                    title={String(row.page_url ?? "")}
                  >
                    {String(row.page_url ?? "—").slice(0, 40)}
                  </td>
                  <td style={{ fontSize: 10 }}>{String(row.bid_count ?? "—")}</td>
                  <td style={{ fontSize: 10, color: bidCol, fontWeight: 700 }}>
                    {Number.isFinite(wb) ? `$${wb.toFixed(4)}` : "—"}
                  </td>
                  <td style={{ fontSize: 10 }}>{row.floor_price != null ? String(row.floor_price) : "—"}</td>
                  <td>{row.cleared ? "✓" : "✗"}</td>
                </tr>
              );
            })}
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
          marginBottom: 12
        }}
      >
        QUICK ACTIONS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {[
          ["Create Ad Unit", "▦", "Set up a new placement", C.blue, "/admin/inventory"],
          ["Onboard DSP", "⚡", "Add demand partner", C.purple, "/admin/demand"],
          ["Generate Tags", "⟨/⟩", "Get JS for your site", C.accent, "/admin/tags"],
          ["New Order", "▶", "Create advertiser order", C.orange, "/admin/delivery"],
          ["AI Ad Format", "✦", "Generate custom format", "#ff6b9d", "/admin/ai"],
          ["Run Report", "◧", "Performance analytics", C.yellow, "/admin/reporting"]
        ].map(([t, ic, d, c, href]) => (
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
            <div style={{ fontSize: 22, marginBottom: 6 }}>{String(ic)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: String(c) }}>{String(t)}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{String(d)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
