// @ts-nocheck — Recharts vs React 18 types.
"use client";

import { ResponsiveContainer } from "@/components/recharts-wrap";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type Payload = {
  timeseries: Array<{ date: string; impressions: number; revenue: number; fillRate: number }>;
  topUnits: Array<{ unitId: string; unitName: string; impressions: number; revenue: number; fillRate: number }>;
  topPages: Array<{ pageUrl: string; impressions: number; revenue: number }>;
  revenueTotal: number;
  revenueChange: number;
};

export function PublisherAnalyticsTab({ publisherId }: { publisherId: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/publisher-analytics/${encodeURIComponent(publisherId)}?range=7d`, {
        credentials: "include"
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(typeof j.error === "string" ? j.error : "Failed");
        return;
      }
      setData(j as Payload);
      setErr(null);
    })();
  }, [publisherId]);

  if (err) return <p style={{ color: "#ff4757" }}>{err}</p>;
  if (!data) return <p style={{ color: "var(--text-muted)" }}>Loading analytics…</p>;

  return (
    <div>
      <div className="kpis" style={{ marginBottom: 20, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        <div className="card">
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Revenue (7d)</div>
          <strong style={{ color: "var(--accent)" }}>${data.revenueTotal.toFixed(2)}</strong>
          <div style={{ fontSize: 10, color: data.revenueChange >= 0 ? "#2ecc71" : "#ff4757" }}>
            {data.revenueChange >= 0 ? "+" : ""}
            {data.revenueChange.toFixed(1)}% vs prior period
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 12, minHeight: 280 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Revenue</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fill="#0066cc33" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 12, minHeight: 280 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Impressions</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="impressions" stroke="#4a9eff" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 12, minHeight: 280 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Fill rate %</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="fillRate" stroke="#ff8c42" fill="#ff8c4233" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 14 }}>Per-unit performance</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Impressions</th>
              <th>Revenue</th>
              <th>Fill %</th>
            </tr>
          </thead>
          <tbody>
            {data.topUnits.map((u) => (
              <tr key={u.unitId}>
                <td>{u.unitName}</td>
                <td>{u.impressions}</td>
                <td>${u.revenue.toFixed(2)}</td>
                <td>{u.fillRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, fontSize: 14 }}>Top pages</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Page URL</th>
              <th>Auctions</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topPages.map((p) => (
              <tr key={p.pageUrl.slice(0, 120)}>
                <td style={{ fontSize: 10, wordBreak: "break-all", maxWidth: 360 }}>{p.pageUrl}</td>
                <td>{p.impressions}</td>
                <td>${p.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
