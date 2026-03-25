// @ts-nocheck — Recharts vs React 18 types.
"use client";

import { ResponsiveContainer } from "@/components/recharts-wrap";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type Payload = {
  timeseries: Array<{
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    winRate: number;
  }>;
  topCreatives: Array<{
    creativeId: string;
    imageUrl: string | null;
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
  }>;
  budgetUtilization: Array<{
    campaignId: string;
    name: string;
    dailyBudget: number;
    spendToday: number;
    utilizationPct: number;
  }>;
};

export function DemandAnalyticsTab({ email }: { email: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch(`/api/demand-analytics?${new URLSearchParams({ email, range: "7d" })}`, {
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
  }, [email]);

  if (err) return <p style={{ color: "#ff4757" }}>{err}</p>;
  if (!data) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 12, minHeight: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Spend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="spend" stroke="#0066cc" dot={false} name="Spend $" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 12, minHeight: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Impressions won</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="impressions" stroke="#4a9eff" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 12, minHeight: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Win rate % / CTR %</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.timeseries}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0c1018", border: "1px solid var(--border)" }} />
              <Legend />
              <Line type="monotone" dataKey="winRate" stroke="#ff8c42" dot={false} name="Win rate" />
              <Line type="monotone" dataKey="ctr" stroke="#a855f7" dot={false} name="CTR" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 14 }}>Budget utilization (today)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Daily budget</th>
              <th>Spend today</th>
              <th>Util %</th>
            </tr>
          </thead>
          <tbody>
            {data.budgetUtilization.map((b) => (
              <tr key={b.campaignId}>
                <td>{b.name}</td>
                <td>${b.dailyBudget.toFixed(2)}</td>
                <td>${b.spendToday.toFixed(2)}</td>
                <td>{b.utilizationPct.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, fontSize: 14 }}>Top creatives by CTR</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {data.topCreatives.map((c) => (
            <div key={c.creativeId} style={{ width: 160, border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt="" style={{ width: "100%", borderRadius: 4 }} />
              ) : (
                <div style={{ height: 90, background: "#0c1018" }} />
              )}
              <div style={{ fontSize: 10, marginTop: 6 }}>
                CTR {c.ctr.toFixed(2)}% · Imp {c.impressions} · ${c.spend.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
