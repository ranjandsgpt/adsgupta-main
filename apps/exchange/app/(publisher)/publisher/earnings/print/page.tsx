"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Stmt = {
  publisherName: string;
  domain: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    totalImpressions: number;
    totalRevenue: number;
    platformFee: number;
    publisherEarnings: number;
    avgCpm: number;
    fillRate: number;
  };
  byUnit: Array<{ unitName: string; impressions: number; revenue: number; avgCpm: number; fillRate: number }>;
  dailyBreakdown: Array<{ date: string; impressions: number; revenue: number; fillRate: number }>;
};

function PrintInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const month = searchParams.get("month") ?? "";
  const [statement, setStatement] = useState<Stmt | null>(null);

  useEffect(() => {
    if (!id || !month) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/publisher-earnings/${encodeURIComponent(id)}?month=${encodeURIComponent(month)}`, {
        credentials: "include"
      });
      const j = (await res.json()) as Stmt;
      if (!cancelled && res.ok) setStatement(j);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, month]);

  if (!id || !month) {
    return <p>Missing id or month.</p>;
  }

  if (!statement) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <p>Loading statement…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: "system-ui, sans-serif", color: "#111", maxWidth: 800, margin: "0 auto" }}>
      <header style={{ borderBottom: "2px solid #111", marginBottom: 24, paddingBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#444" }}>MDE Exchange</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 22 }}>Publisher earnings statement</h1>
        <p style={{ margin: "8px 0 0", fontSize: 13 }}>
          {statement.publisherName} · {statement.domain}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13 }}>
          Period: {statement.period} ({statement.periodStart} — {statement.periodEnd})
        </p>
      </header>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14 }}>Summary</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {[
              ["Gross revenue (auction)", statement.summary.totalRevenue.toFixed(4)],
              ["Platform fee (15%)", statement.summary.platformFee.toFixed(4)],
              ["Publisher share (85%)", statement.summary.publisherEarnings.toFixed(4)],
              ["Impressions", String(statement.summary.totalImpressions)],
              ["Avg eCPM", statement.summary.avgCpm.toFixed(4)],
              ["Fill rate", `${statement.summary.fillRate.toFixed(1)}%`]
            ].map(([k, v]) => (
              <tr key={String(k)}>
                <td style={{ padding: "4px 8px 4px 0", borderBottom: "1px solid #ddd" }}>{k}</td>
                <td style={{ padding: "4px 0", borderBottom: "1px solid #ddd", textAlign: "right" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14 }}>By ad unit</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #111" }}>Unit</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #111" }}>Impr.</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #111" }}>Revenue</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #111" }}>eCPM</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #111" }}>Fill</th>
            </tr>
          </thead>
          <tbody>
            {statement.byUnit.map((u) => (
              <tr key={u.unitName}>
                <td style={{ padding: "4px 8px 4px 0" }}>{u.unitName}</td>
                <td style={{ textAlign: "right" }}>{u.impressions}</td>
                <td style={{ textAlign: "right" }}>{u.revenue.toFixed(4)}</td>
                <td style={{ textAlign: "right" }}>{u.avgCpm.toFixed(4)}</td>
                <td style={{ textAlign: "right" }}>{u.fillRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ fontSize: 14 }}>Daily</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #111" }}>Date</th>
              <th style={{ textAlign: "right" }}>Impr.</th>
              <th style={{ textAlign: "right" }}>Revenue</th>
              <th style={{ textAlign: "right" }}>Fill</th>
            </tr>
          </thead>
          <tbody>
            {statement.dailyBreakdown.map((d) => (
              <tr key={d.date}>
                <td style={{ padding: "2px 8px 2px 0" }}>{d.date}</td>
                <td style={{ textAlign: "right" }}>{d.impressions}</td>
                <td style={{ textAlign: "right" }}>{d.revenue.toFixed(4)}</td>
                <td style={{ textAlign: "right" }}>{d.fillRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p style={{ marginTop: 32, fontSize: 10, color: "#666" }}>
        Use your browser Print dialog → Save as PDF. Estimates and fees as shown; subject to final reconciliation.
      </p>
    </div>
  );
}

export default function EarningsPrintPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <PrintInner />
    </Suspense>
  );
}
