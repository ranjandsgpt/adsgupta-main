"use client";

import { useEffect, useState } from "react";

type Row = Record<string, unknown>;

export default function AdminAuctionLogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await fetch("/api/auction-log", { credentials: "include" });
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

  const cols =
    rows[0] != null
      ? Object.keys(rows[0])
      : ["auction_id", "winning_bid", "bid_count", "cleared", "created_at"];

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Auction log</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Refreshes every <strong>5 seconds</strong>.
      </p>
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ marginTop: 16, overflow: "auto", maxHeight: "70vh" }}>
        <table className="table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c} style={{ fontSize: 11, maxWidth: 220, wordBreak: "break-all" }}>
                    {formatCell(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>No rows yet.</p>
        )}
      </div>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
