"use client";

import { useMemo, useState } from "react";

export default function CustomReportBuilderPage() {
  const [dims, setDims] = useState<string[]>(["country", "device"]);
  const [metrics, setMetrics] = useState<string[]>(["auctions", "impressions", "revenue"]);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("dimensions", dims.join(","));
    sp.set("metrics", metrics.join(","));
    return sp.toString();
  }, [dims, metrics]);

  return (
    <div className="page-content" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ margin: 0, fontSize: 18, color: "var(--text-bright)" }}>Custom Report Builder</h1>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
        Choose dimensions and metrics, then run an admin analytics query.
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ padding: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 900 }}>Dimensions (comma separated)</div>
            <input
              className="input"
              value={dims.join(",")}
              onChange={(e) => setDims(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="publisher,country,device,format"
            />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 900 }}>Metrics (comma separated)</div>
            <input
              className="input"
              value={metrics.join(",")}
              onChange={(e) => setMetrics(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="auctions,impressions,fill_rate,revenue"
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn-primary" href={`/api/analytics?${query}`} target="_blank" rel="noreferrer">
              Run Report
            </a>
            <a className="btn-secondary" href={`/api/analytics?${query}&format=csv`} target="_blank" rel="noreferrer">
              Export CSV
            </a>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            (This is a lightweight UI wrapper; the API enforces admin auth.)
          </div>
        </div>
      </div>
    </div>
  );
}

