"use client";

import { useEffect, useState } from "react";

type Health = {
  status: string;
  timestamp: string;
  checks: {
    database: { status: string; latencyMs: number };
    auction: { status: string; avgLatencyMs?: number; p95LatencyMs: number; fillRate1h: number };
    blob: { status: string };
  };
  metrics?: Record<string, unknown>;
};

export default function StatusPage() {
  const [h, setH] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    async function pull() {
      try {
        const r = await fetch("/api/health");
        const j = await r.json();
        if (!r.ok) throw new Error("bad");
        setH(j);
        setErr(null);
      } catch {
        setErr("Unable to reach health endpoint");
      }
    }
    void pull();
    id = setInterval(pull, 30000);
    return () => clearInterval(id);
  }, []);

  const color =
    h?.status === "healthy" ? "#2ecc71" : h?.status === "degraded" ? "#ffd32a" : h?.status === "down" ? "#ff4757" : "#718096";

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#e8f0f8", fontFamily: "system-ui,sans-serif", padding: 40 }}>
      <h1 style={{ marginTop: 0 }}>MyExchange status</h1>
      <p style={{ color: "#718096", fontSize: 14 }}>Operational status for exchange.adsgupta.com</p>

      {err && <p style={{ color: "#ff4757" }}>{err}</p>}

      {h && (
        <div style={{ marginTop: 24, maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}` }} />
            <span style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase", color }}>{h.status}</span>
          </div>
          <div style={{ fontSize: 12, color: "#718096", marginBottom: 16 }}>Updated {h.timestamp}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 0" }}>Database</td>
                <td style={{ textAlign: "right" }}>
                  {h.checks.database.status} · {h.checks.database.latencyMs}ms
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 0" }}>Auction handler</td>
                <td style={{ textAlign: "right" }}>
                  {h.checks.auction.status} · p95 {h.checks.auction.p95LatencyMs}ms · fill {h.checks.auction.fillRate1h?.toFixed?.(1) ?? h.checks.auction.fillRate1h}%
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0" }}>Blob storage</td>
                <td style={{ textAlign: "right" }}>{h.checks.blob.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
