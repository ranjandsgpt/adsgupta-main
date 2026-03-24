"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, unknown>;

export default function AdminAuctionLogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await fetch("/api/auction-log?limit=200", { credentials: "include" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Failed to load");
          return;
        }
        setRows(Array.isArray(data) ? data : []);
        setError(null);
      } catch {
        if (!cancelled) setError("Network error");
      }
    }

    pull();
    const id = setInterval(pull, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayRows = rows.filter((r) => String(r.created_at ?? "").startsWith(today));
    const total = todayRows.length;
    const cleared = todayRows.filter((r) => r.cleared === true).length;
    const fill = total > 0 ? (cleared / total) * 100 : 0;
    const bids = todayRows
      .map((r) => Number(r.winning_bid))
      .filter((n) => !Number.isNaN(n) && n > 0);
    const avgWin = bids.length ? bids.reduce((a, b) => a + b, 0) / bids.length : 0;
    return { total, fill, avgWin };
  }, [rows, today]);

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Live Telemetry ⚡</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Refreshes every <strong>5 seconds</strong>.</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", fontSize: 12 }}>
        <div className="card" style={{ minWidth: 140 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10 }}>Auctions today</div>
          <strong style={{ color: "var(--text-bright)" }}>{stats.total}</strong>
        </div>
        <div className="card" style={{ minWidth: 140 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10 }}>Fill rate today</div>
          <strong style={{ color: "var(--text-bright)" }}>{stats.fill.toFixed(1)}%</strong>
        </div>
        <div className="card" style={{ minWidth: 140 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10 }}>Avg winning bid</div>
          <strong style={{ color: "var(--text-bright)" }}>${stats.avgWin.toFixed(4)}</strong>
        </div>
      </div>

      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ overflow: "auto", maxHeight: "65vh" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Auction ID</th>
              <th>Publisher</th>
              <th>Ad unit</th>
              <th>Page</th>
              <th>Bids</th>
              <th>Win bid</th>
              <th>Floor</th>
              <th>Cleared</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cleared = r.cleared === true;
              return (
                <tr
                  key={i}
                  style={{
                    background: cleared ? "rgba(46, 204, 113, 0.06)" : "rgba(255, 71, 87, 0.05)"
                  }}
                >
                  <td style={{ fontSize: 10 }}>{String(r.created_at ?? "").slice(0, 19)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 10 }}>{String(r.auction_id ?? "").slice(0, 10)}…</td>
                  <td style={{ fontSize: 10 }}>{String(r.publisher_domain ?? "—")}</td>
                  <td style={{ fontSize: 10 }}>{String(r.ad_unit_name ?? "—")}</td>
                  <td style={{ fontSize: 9, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {String(r.page_url ?? "—").slice(0, 48)}
                  </td>
                  <td>{String(r.bid_count ?? "")}</td>
                  <td>{String(r.winning_bid ?? "—")}</td>
                  <td>{String(r.floor_price ?? "—")}</td>
                  <td>{cleared ? "✓" : "✗"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && !error && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", padding: 16, margin: 0 }}>
            No auctions yet. Activate a publisher and campaign, then embed mde.js on any page.
          </p>
        )}
      </div>
    </div>
  );
}
