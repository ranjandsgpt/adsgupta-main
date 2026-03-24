// @ts-nocheck — Recharts vs React 18 types.
"use client";

import { ResponsiveContainer } from "@/components/recharts-wrap";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

type Health = {
  status: string;
  timestamp: string;
  checks: {
    database: { status: string; latencyMs: number };
    auction: { status: string; avgLatencyMs: number; p95LatencyMs: number; fillRate1h: number; latencyHistogram: number[]; samples: number };
    blob: { status: string };
  };
  metrics: {
    auctionsLast1h: number;
    impressionsLast1h: number;
    fillRateLast1h: number;
    avgBidPriceLast1h: number;
    activeCampaigns: number;
    activePublishers: number;
    activeSseConnections: number;
    auctionsSpark24h: number[];
    fillSpark24h: number[];
  };
  recentErrors: Array<{ ts: string; source: string; message: string }>;
};

export default function AdminHealthPage() {
  const [h, setH] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    async function pull() {
      try {
        const r = await fetch("/api/health", { credentials: "include" });
        const j = await r.json();
        if (!r.ok) throw new Error("fail");
        setH(j);
        setErr(null);
      } catch {
        setErr("Failed to load health");
      }
    }
    void pull();
    id = setInterval(pull, 15000);
    return () => clearInterval(id);
  }, []);

  const histData =
    h?.checks.auction.latencyHistogram?.map((v, i) => ({
      bucket: `${i}`,
      count: v
    })) ?? [];

  const volData =
    h?.metrics.auctionsSpark24h?.map((v, hour) => ({
      hour,
      auctions: v
    })) ?? [];

  const fillData =
    h?.metrics.fillSpark24h?.map((v, hour) => ({
      hour,
      fill: Math.round(v * 10) / 10
    })) ?? [];

  const dot = (st: string) => {
    const c = st === "up" || st === "configured" ? "#2ecc71" : st === "degraded" ? "#ffd32a" : "#ff4757";
    return <span style={{ color: c, fontSize: 18 }}>●</span>;
  };

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Exchange health</h1>
      {err && <p style={{ color: "#ff4757" }}>{err}</p>}
      {h && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div className="card">{dot(h.checks.database.status)} DB {h.checks.database.latencyMs}ms</div>
            <div className="card">
              {dot(h.checks.auction.status)} Auction p95 {h.checks.auction.p95LatencyMs}ms · samples {h.checks.auction.samples}
            </div>
            <div className="card">
              {dot(h.checks.blob.status === "configured" ? "up" : "degraded")} Blob {h.checks.blob.status}
            </div>
            <div className="card">SSE clients: {h.metrics.activeSseConnections}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ minHeight: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>24h auction volume (by hour UTC)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volData}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid #1a2332" }} />
                  <Bar dataKey="auctions" fill="#4a9eff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ minHeight: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>24h fill rate % (by hour)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={fillData}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid #1a2332" }} />
                  <Bar dataKey="fill" fill="#00d4aa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ minHeight: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Response time histogram (samples)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={histData}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid #1a2332" }} />
                  <Bar dataKey="count" fill="#ff8c42" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Last hour</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Auctions: {h.metrics.auctionsLast1h} · Impressions: {h.metrics.impressionsLast1h} · Fill {h.metrics.fillRateLast1h?.toFixed?.(1)}%
              · Avg bid {h.metrics.avgBidPriceLast1h?.toFixed?.(4)} · Active campaigns {h.metrics.activeCampaigns} · Publishers{" "}
              {h.metrics.activePublishers}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Recent errors (in-process ring buffer)</div>
            {(h.recentErrors?.length ?? 0) === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No captured errors. Wire pushRecentError from log drains to populate.</p>
            ) : (
              <ul style={{ fontSize: 11, margin: 0, paddingLeft: 18 }}>
                {h.recentErrors.map((e, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <span style={{ color: "#5a6d82" }}>{e.ts}</span> [{e.source}] {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
