"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import type { FloorAnalysis } from "@/lib/floor-analysis-types";

function SvgLineChart({
  points,
  width,
  height,
  color,
  labelY
}: {
  points: { x: number; y: number }[];
  width: number;
  height: number;
  color: string;
  labelY: string;
}) {
  if (points.length < 2) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = 0;
  const maxY = Math.max(...ys, 0.001);
  const pad = 8;
  const W = width - pad * 2;
  const H = height - pad * 2;
  const path = points
    .map((p, i) => {
      const px = pad + ((p.x - minX) / (maxX - minX || 1)) * W;
      const py = pad + H - ((p.y - minY) / (maxY - minY)) * H;
      return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <text x={4} y={12} fill="var(--text-muted)" fontSize={9}>
        {labelY}
      </text>
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

function OptimizerInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<{
    eligible: boolean;
    reason?: string;
    auctionCount7d?: number;
    units: FloorAnalysis[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customFloors, setCustomFloors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const res = await fetch(`/api/publisher-floor-analysis/${encodeURIComponent(id)}`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed");
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function applyFloor(unitId: string, floor: number) {
    if (!id) return;
    const res = await fetch(`/api/inventory/${encodeURIComponent(unitId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publisher_id: id, floor_price: floor })
    });
    if (!res.ok) {
      setError("Could not update floor");
      return;
    }
    void load();
  }

  if (!id) {
    return <p style={{ color: "var(--text-muted)" }}>Add ?id= with your publisher UUID.</p>;
  }

  if (!data) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  if (!data.eligible) {
    return (
      <div>
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20 }}>Floor optimizer</h1>
        <p style={{ color: "var(--text-muted)" }}>{data.reason ?? "Not enough data yet."}</p>
        {data.auctionCount7d != null && (
          <p style={{ fontSize: 12 }}>Auctions (7d): {data.auctionCount7d} — need more than 50.</p>
        )}
        <Link href={`/publisher/dashboard?id=${encodeURIComponent(id)}`} style={{ color: "var(--accent)" }}>
          ← Dashboard
        </Link>
      </div>
    );
  }

  const totalLeft =
    data.units.reduce((s, u) => s + Math.max(0, u.optimalRevenuePer1000 - u.currentRevenuePer1000), 0) ?? 0;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, marginBottom: 8 }}>Floor price optimizer</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
        Modeled from your last 7 days of auction outcomes. Higher revenue tier = best modeled $/1k auctions.
      </p>
      {error && <p style={{ color: "#ff4757" }}>{error}</p>}

      <div className="card" style={{ marginBottom: 20, borderColor: "#0066cc44" }}>
        <strong style={{ color: "var(--accent)" }}>Summary</strong>
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          Your current floors are leaving approximately <strong>${totalLeft.toFixed(2)}</strong> on the table per 1000
          impressions (modeled from your recent auction sample vs optimal tier).
        </p>
      </div>

      {data.units.map((u) => {
        const fillPts = u.tiers.map((t) => ({ x: t.floor, y: t.estimatedFillRate * 100 }));
        const revPts = u.tiers.map((t) => ({ x: t.floor, y: t.estimatedRevenuePer1000 }));
        const custom = customFloors[u.adUnitId] ?? "";
        return (
          <div key={u.adUnitId} className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 12px" }}>{u.adUnitName}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Current floor</div>
                <strong>${u.currentFloor.toFixed(2)}</strong>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Optimal floor</div>
                <strong style={{ color: "var(--accent)" }}>${u.optimalFloor.toFixed(2)}</strong>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Revenue uplift</div>
                <strong>{u.revenueUplift >= 0 ? "+" : ""}
                  {u.revenueUplift.toFixed(0)}%
                </strong>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.recommendation}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Fill rate vs floor (%)</div>
                <SvgLineChart points={fillPts} width={320} height={120} color="#4a9eff" labelY="fill%" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Est. revenue vs floor ($/1k)</div>
                <SvgLineChart points={revPts} width={320} height={120} color="#0066cc" labelY="$/1k" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
              <button type="button" onClick={() => void applyFloor(u.adUnitId, u.optimalFloor)}>
                Apply optimal floor (${u.optimalFloor.toFixed(2)})
              </button>
              <input
                placeholder="Custom floor"
                value={custom}
                onChange={(e) => setCustomFloors((m) => ({ ...m, [u.adUnitId]: e.target.value }))}
                style={{ maxWidth: 120, padding: 6 }}
              />
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  const n = Number(custom);
                  if (Number.isFinite(n) && n > 0) void applyFloor(u.adUnitId, n);
                }}
              >
                Apply custom
              </button>
            </div>
          </div>
        );
      })}

      <Link href={`/publisher/dashboard?id=${encodeURIComponent(id)}`} style={{ color: "var(--accent)" }}>
        ← Dashboard
      </Link>
    </div>
  );
}

export default function FloorOptimizerPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <OptimizerInner />
    </Suspense>
  );
}
