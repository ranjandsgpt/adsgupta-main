"use client";

import { AdminToast } from "@/components/admin-toast";
import { useCallback, useEffect, useState } from "react";

type Row = {
  publisherId: string;
  name: string;
  revenue: number;
};

export default function AdminEarningsPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [data, setData] = useState<{
    period: string;
    platformRevenueGross: number;
    platformFee: number;
    publisherShare: number;
    monthOverMonthGrowthPct: number;
    topPublishers: Row[];
    allPublishers?: Row[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/earnings?month=${encodeURIComponent(month)}`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed");
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  function exportCsv() {
    if (!data) return;
    const rows = data.allPublishers?.length ? data.allPublishers : data.topPublishers;
    const lines = [
      ["period", "publisher_id", "name", "revenue"].join(","),
      ...rows.map((r) =>
        [data.period, r.publisherId, JSON.stringify(r.name), r.revenue.toFixed(6)].join(",")
      )
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mde-earnings-all-publishers-${data.period}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("CSV downloaded");
  }

  return (
    <div style={{ maxWidth: 960 }}>
      {toast && <AdminToast message={toast} onClear={() => setToast(null)} />}
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, marginBottom: 8 }}>Platform earnings</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>
        Gross auction revenue across all publishers; 15% platform fee shown for transparency.
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 11 }}>Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button type="button" className="secondary" onClick={() => void load()}>
          Refresh
        </button>
        <button type="button" onClick={exportCsv} disabled={!data}>
          Export CSV (all publishers)
        </button>
      </div>

      {error && <p style={{ color: "#ff4757" }}>{error}</p>}

      {data && (
        <>
          <div className="kpis" style={{ marginBottom: 20, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
            {[
              ["Gross revenue ($)", data.platformRevenueGross.toFixed(4)],
              ["Platform fee 15% ($)", data.platformFee.toFixed(4)],
              ["Paid to publishers 85% ($)", data.publisherShare.toFixed(4)],
              ["MoM growth %", `${data.monthOverMonthGrowthPct.toFixed(1)}%`]
            ].map(([a, b]) => (
              <div key={String(a)} className="card">
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{a}</div>
                <strong>{b}</strong>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Top 10 publishers by revenue ({data.period})</h2>
          <div style={{ overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Publisher</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topPublishers.map((r, i) => (
                  <tr key={r.publisherId}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.revenue.toFixed(4)}</td>
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
