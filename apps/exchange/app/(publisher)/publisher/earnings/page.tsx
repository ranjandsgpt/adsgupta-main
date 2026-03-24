"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

type Statement = {
  publisherName: string;
  domain: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    totalRevenue: number;
    platformFee: number;
    publisherEarnings: number;
    avgCpm: number;
    fillRate: number;
  };
  byUnit: Array<{
    unitId: string;
    unitName: string;
    impressions: number;
    revenue: number;
    avgCpm: number;
    fillRate: number;
  }>;
  dailyBreakdown: Array<{ date: string; impressions: number; revenue: number; fillRate: number }>;
};

function monthOptionsFromJoined(iso: string): string[] {
  const start = iso.slice(0, 7);
  const out: string[] = [];
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  for (let i = 0; i < 48; i++) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (key >= start) out.push(key);
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
  }
  return out.sort().reverse();
}

function EarningsInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [statement, setStatement] = useState<Statement | null>(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [joined, setJoined] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [res, pub] = await Promise.all([
        fetch(`/api/publisher-earnings/${encodeURIComponent(id)}?month=${encodeURIComponent(month)}`, {
          credentials: "include"
        }),
        fetch(`/api/publishers/${encodeURIComponent(id)}`, { credentials: "include" })
      ]);
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed");
      setStatement(j);
      if (pub.ok) {
        const p = await pub.json();
        setJoined(typeof p.created_at === "string" ? p.created_at : null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [id, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthOptions = useMemo(() => {
    if (!joined) return [month];
    return monthOptionsFromJoined(joined);
  }, [joined, month]);

  if (!id) {
    return <p style={{ color: "var(--text-muted)" }}>Add ?id= publisher UUID.</p>;
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20 }}>Earnings statement</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: 6 }}>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="secondary"
            onClick={() =>
              window.open(
                `/publisher/earnings/print?id=${encodeURIComponent(id)}&month=${encodeURIComponent(month)}`,
                "_blank"
              )
            }
          >
            Download statement PDF
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#ff4757" }}>{error}</p>}

      {statement && (
        <>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {statement.publisherName} · {statement.domain} · {statement.periodStart} — {statement.periodEnd}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            MDE charges a 15% platform fee. You receive 85% of gross auction revenue attributed to your inventory.
          </p>

          <div className="kpis" style={{ marginBottom: 20, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
            {[
              ["Impressions", statement.summary.totalImpressions.toLocaleString()],
              ["Publisher earnings ($)", statement.summary.publisherEarnings.toFixed(4)],
              ["Platform fee 15% ($)", statement.summary.platformFee.toFixed(4)],
              ["Avg eCPM ($)", statement.summary.avgCpm.toFixed(4)],
              ["Fill rate %", `${statement.summary.fillRate.toFixed(1)}%`]
            ].map(([a, b]) => (
              <div key={String(a)} className="card">
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{a}</div>
                <strong>{b}</strong>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 14, marginBottom: 8 }}>By ad unit</h2>
          <div style={{ overflow: "auto", marginBottom: 24 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Impressions</th>
                  <th>Revenue</th>
                  <th>Avg CPM</th>
                  <th>Fill %</th>
                </tr>
              </thead>
              <tbody>
                {statement.byUnit.map((u) => (
                  <tr key={u.unitId}>
                    <td>{u.unitName}</td>
                    <td>{u.impressions}</td>
                    <td>{u.revenue.toFixed(4)}</td>
                    <td>{u.avgCpm.toFixed(4)}</td>
                    <td>{u.fillRate.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Daily breakdown</h2>
          <div style={{ overflow: "auto", maxHeight: 400 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Impressions</th>
                  <th>Revenue</th>
                  <th>Fill %</th>
                </tr>
              </thead>
              <tbody>
                {statement.dailyBreakdown.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.impressions}</td>
                    <td>{d.revenue.toFixed(4)}</td>
                    <td>{d.fillRate.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href={`/publisher/dashboard?id=${encodeURIComponent(id)}`} style={{ color: "var(--accent)" }}>
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}

export default function PublisherEarningsPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <EarningsInner />
    </Suspense>
  );
}
