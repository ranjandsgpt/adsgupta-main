// @ts-nocheck — Recharts component types vs workspace React 18 types (duplicate @types/react).
"use client";

import { ResponsiveContainer } from "@/components/recharts-wrap";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const C = {
  card: "#0f1419",
  border: "#1a2332",
  muted: "#5a6d82",
  bright: "#e8f0f8",
  accent: "#00d4aa",
  blue: "#4a9eff",
  yellow: "#ffd32a"
};

type AnalyticsPayload = {
  timeseries: Array<{
    date: string;
    auctions: number;
    impressions: number;
    clicks: number;
    revenue: number;
    fillRate: number;
    avgCpm: number;
  }>;
  topPublishers: Array<{
    id: string;
    name: string;
    domain: string;
    impressions: number;
    revenue: number;
    sparkline: number[];
  }>;
  topCampaigns: Array<{ id: string; name: string; impressions: number; spend: number; ctr: number }>;
  topUnits: Array<{ id: string; name: string; impressions: number; fillRate: number }>;
  geoBreakdown: Array<{ country: string; flag: string; impressions: number; revenue: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; impressions: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; auctions: number }>;
  fillRateTrend: Array<{ date: string; fillRate: number }>;
};

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: 100, height: 32 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pts}>
          <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"today" | "yesterday" | "7d" | "30d" | "custom">("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [pubs, setPubs] = useState<{ id: string; name: string }[]>([]);
  const [camps, setCamps] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("range", range);
    if (range === "custom" && customFrom && customTo) {
      p.set("from", customFrom);
      p.set("to", customTo);
    }
    if (publisherId) p.set("publisherId", publisherId);
    if (campaignId) p.set("campaignId", campaignId);
    return p.toString();
  }, [range, customFrom, customTo, publisherId, campaignId]);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch(`/api/analytics?${qs}`, { credentials: "include" });
    const j = await res.json();
    if (!res.ok) {
      setErr(typeof j.error === "string" ? j.error : "Failed");
      return;
    }
    setData(j as AnalyticsPayload);
  }, [qs]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetch("/api/publishers", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setPubs(d.filter((x: { status?: string }) => x.status === "active"));
      });
    void fetch("/api/campaigns", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCamps(d.map((c: { id: string; campaign_name?: string; name?: string }) => ({ id: c.id, name: c.campaign_name ?? c.name ?? c.id })));
      });
  }, []);

  const totals = useMemo(() => {
    if (!data?.timeseries?.length) return null;
    return data.timeseries.reduce(
      (a, t) => ({
        auctions: a.auctions + t.auctions,
        impressions: a.impressions + t.impressions,
        revenue: a.revenue + t.revenue,
        clicks: a.clicks + t.clicks
      }),
      { auctions: 0, impressions: 0, revenue: 0, clicks: 0 }
    );
  }, [data]);

  const avgFill =
    data?.timeseries?.length && totals && totals.auctions > 0
      ? (data.timeseries.reduce((s, t) => s + t.fillRate * t.auctions, 0) / totals.auctions).toFixed(1)
      : "—";

  return (
    <div>
      <h1 style={{ color: C.bright, marginTop: 0 }}>Analytics</h1>
      <p style={{ fontSize: 12, color: C.muted }}>Revenue uses impression clearing (winning_bid / 1000).</p>

      <div className="card" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Range</div>
          <select value={range} onChange={(e) => setRange(e.target.value as typeof range)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {range === "custom" && (
          <>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </>
        )}
        <div>
          <div style={{ fontSize: 10, color: C.muted }}>Publisher</div>
          <select value={publisherId} onChange={(e) => setPublisherId(e.target.value)} style={{ minWidth: 140 }}>
            <option value="">All</option>
            {pubs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted }}>Campaign</div>
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ minWidth: 140 }}>
            <option value="">All</option>
            {camps.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.slice(0, 40)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {err && <p style={{ color: "#ff4757" }}>{err}</p>}

      {totals && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            ["Auctions", totals.auctions],
            ["Impressions", totals.impressions],
            ["Clicks", totals.clicks],
            ["Revenue $", totals.revenue.toFixed(2)],
            ["Avg fill %", avgFill]
          ].map(([k, v]) => (
            <div key={String(k)} className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: C.muted }}>{k}</div>
              <strong style={{ color: C.bright }}>{v}</strong>
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 12, minHeight: 320 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Revenue over time</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.timeseries}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: `1px solid ${C.border}` }} />
                  <Area type="monotone" dataKey="revenue" stroke={C.accent} fill={`${C.accent}33`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: 12, minHeight: 320 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, marginBottom: 8 }}>Auctions vs impressions</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.timeseries}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: `1px solid ${C.border}` }} />
                  <Legend />
                  <Line type="monotone" dataKey="auctions" stroke={C.yellow} dot={false} name="Auctions" />
                  <Line type="monotone" dataKey="impressions" stroke={C.blue} dot={false} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: 12, minHeight: 320 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ff8c42", marginBottom: 8 }}>Fill rate trend</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.fillRateTrend}>
                  <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0c1018", border: `1px solid ${C.border}` }} />
                  <Area type="monotone" dataKey="fillRate" stroke="#ff8c42" fill="#ff8c4233" name="% fill" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10 }}>Hourly auction distribution (UTC)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.hourlyDistribution}>
                <CartesianGrid stroke="#1a2332" strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#0c1018", border: `1px solid ${C.border}` }} />
                <Bar dataKey="auctions" fill={C.blue} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 12, overflow: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Top publishers</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Publisher</th>
                    <th>Imp</th>
                    <th>Rev $</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPublishers.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>{p.domain}</div>
                      </td>
                      <td>{p.impressions}</td>
                      <td>{p.revenue.toFixed(2)}</td>
                      <td>
                        <MiniSpark data={p.sparkline} color={C.accent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ padding: 12, overflow: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Top campaigns</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Imp</th>
                    <th>Spend</th>
                    <th>CTR %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCampaigns.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.impressions}</td>
                      <td>{c.spend.toFixed(2)}</td>
                      <td>{c.ctr.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Top ad units</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Imp</th>
                    <th>Fill %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUnits.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.impressions}</td>
                      <td>{u.fillRate.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Geo (TLD proxy)</div>
              <table className="table">
                <thead>
                  <tr>
                    <th />
                    <th>Region</th>
                    <th>Imp</th>
                    <th>Rev $</th>
                  </tr>
                </thead>
                <tbody>
                  {data.geoBreakdown.map((g) => (
                    <tr key={g.country}>
                      <td style={{ fontSize: 16 }}>{g.flag}</td>
                      <td>{g.country}</td>
                      <td>{g.impressions}</td>
                      <td>{g.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: 12, marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Device breakdown</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Impressions</th>
                  <th>Share %</th>
                </tr>
              </thead>
              <tbody>
                {data.deviceBreakdown.map((d) => (
                  <tr key={d.device}>
                    <td>{d.device}</td>
                    <td>{d.impressions}</td>
                    <td>{d.percentage.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
