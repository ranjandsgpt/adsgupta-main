"use client";

import { Fragment, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

type Row = Record<string, unknown>;

const C = {
  green: "#2ecc71",
  red: "#ff4757",
  muted: "#718096",
  bright: "#e8f0f8",
  border: "#e2e8f0",
  card: "#f8f9fa"
};

function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function bidColor(v: number): string {
  if (v > 2) return C.green;
  if (v >= 0.5) return "#ff8c42";
  return C.muted;
}

export default function AdminAuctionLogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pubs, setPubs] = useState<{ id: string; name: string; domain: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<"today" | "yesterday" | "7d" | "custom">("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [cleared, setCleared] = useState<"all" | "true" | "false">("all");
  const [ivtOnly, setIvtOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  /** off = live disabled; connecting = first open; connected = SSE open; reconnecting = backing off after error */
  const [sseConn, setSseConn] = useState<"off" | "connecting" | "connected" | "reconnecting">("off");
  const flashIds = useRef(new Set<string>());
  const [, flashTick] = useReducer((n: number) => n + 1, 0);

  function flashRow(id: string) {
    flashIds.current.add(id);
    flashTick();
    window.setTimeout(() => {
      flashIds.current.delete(id);
      flashTick();
    }, 2000);
  }

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "200");
    if (preset === "custom" && from && to) {
      p.set("dateFrom", from);
      p.set("dateTo", to);
    } else {
      p.set("preset", preset);
    }
    if (publisherId) p.set("publisherId", publisherId);
    if (cleared !== "all") p.set("cleared", cleared);
    if (ivtOnly) p.set("ivt", "only");
    return p.toString();
  }, [preset, from, to, publisherId, cleared, ivtOnly]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/auction-log?${qs}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to load");
        return;
      }
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Network error");
    }
  }, [qs]);

  useEffect(() => {
    void fetch("/api/publishers", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setPubs(d);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!live || typeof window === "undefined") {
      setSseConn("off");
      return;
    }

    let cancelled = false;
    let attempt = 0;
    let reconnectTimer: number | undefined;
    let es: EventSource | null = null;

    const closeEs = () => {
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      es?.close();
      es = null;
    };

    function connect() {
      if (cancelled) return;
      const url = new URL("/api/auction-stream", window.location.origin);
      if (publisherId) url.searchParams.set("publisherId", publisherId);
      setSseConn((c) => (c === "connected" ? "reconnecting" : "connecting"));
      es = new EventSource(url.toString(), { withCredentials: true } as EventSourceInit);
      es.onopen = () => {
        if (!cancelled) {
          attempt = 0;
          setSseConn("connected");
        }
      };
      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as { type?: string; row?: Row };
          if (msg.type === "auction" && msg.row && typeof msg.row === "object") {
            const row = msg.row;
            const rid = String(row.id ?? "");
            if (!rid) return;
            setRows((prev) => {
              if (prev.some((r) => String(r.id) === rid)) return prev;
              return [row, ...prev];
            });
            flashRow(rid);
          }
        } catch {
          /* ignore malformed */
        }
      };
      es.onerror = () => {
        if (cancelled) return;
        closeEs();
        setSseConn("reconnecting");
        const delay = Math.min(30_000, 800 * Math.pow(2, attempt));
        attempt += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      closeEs();
    };
  }, [live, publisherId]);

  const todayStats = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    const todayRows = rows.filter((r) => String(r.created_at ?? "").slice(0, 10) === day);
    const total = todayRows.length;
    const clearedN = todayRows.filter((r) => r.cleared === true).length;
    const fill = total > 0 ? (clearedN / total) * 100 : 0;
    const bids = todayRows.map((r) => Number(r.winning_bid)).filter((n) => !Number.isNaN(n) && n > 0);
    const avgWin = bids.length ? bids.reduce((a, b) => a + b, 0) / bids.length : 0;
    const rev = todayRows.reduce((s, r) => s + Number(r.winning_bid ?? 0) / 1000, 0);
    return { total, fill, avgWin, rev, impr: clearedN };
  }, [rows]);

  function exportCsv() {
    window.open(`/api/auction-log?${qs}&format=csv`, "_blank");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Auction log</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            Production telemetry · When live is on, new rows arrive via Server-Sent Events only (no polling).
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted, cursor: "pointer" }}>
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live stream (SSE)
          </label>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.muted }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: !live ? C.muted : sseConn === "connected" ? C.green : C.red,
                boxShadow:
                  live && sseConn === "connected"
                    ? `0 0 10px ${C.green}`
                    : live && sseConn === "reconnecting"
                      ? `0 0 8px ${C.red}`
                      : "none",
                animation: live && sseConn !== "connected" ? "pulse 1.2s ease-in-out infinite" : "none"
              }}
            />
            <span style={{ fontWeight: 700, color: !live ? C.muted : sseConn === "connected" ? C.green : C.red }}>
              {!live ? "Off" : sseConn === "connected" ? "Connected" : sseConn === "reconnecting" ? "Reconnecting" : "Connecting"}
            </span>
          </span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <button type="button" className="secondary" style={{ fontSize: 11 }} onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, fontSize: 12 }}>
        {[
          ["Auctions Today", String(todayStats.total)],
          ["Fill Rate Today", `${todayStats.fill.toFixed(1)}%`],
          ["Avg CPM Today", `$${todayStats.avgWin.toFixed(4)}`],
          ["Revenue Today", `$${todayStats.rev.toFixed(2)}`],
          ["Impressions Today", String(todayStats.impr)]
        ].map(([k, v]) => (
          <div key={k} className="card" style={{ minWidth: 130, padding: 10 }}>
            <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{k}</div>
            <strong style={{ color: "var(--text-bright)" }}>{v}</strong>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}
      >
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Range</div>
          <select value={preset} onChange={(e) => setPreset(e.target.value as typeof preset)} style={{ fontSize: 11 }}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 days</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {preset === "custom" && (
          <>
            <div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>From</div>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>To</div>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Publisher</div>
          <select value={publisherId} onChange={(e) => setPublisherId(e.target.value)} style={{ fontSize: 11, minWidth: 160 }}>
            <option value="">All publishers</option>
            {pubs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Status</div>
          <select value={cleared} onChange={(e) => setCleared(e.target.value as typeof cleared)} style={{ fontSize: 11 }}>
            <option value="all">All</option>
            <option value="true">Cleared</option>
            <option value="false">No fill</option>
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted, cursor: "pointer" }}>
          <input type="checkbox" checked={ivtOnly} onChange={(e) => setIvtOnly(e.target.checked)} />
          IVT only
        </label>
        <button type="button" style={{ fontSize: 11 }} onClick={() => void load()}>
          Apply
        </button>
      </div>

      {error && <p style={{ color: C.red, fontSize: 12 }}>{error}</p>}
      <div style={{ overflow: "auto", maxHeight: "70vh" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Auction ID</th>
              <th>Publisher domain</th>
              <th>Ad unit</th>
              <th>Page URL</th>
              <th>Bids</th>
              <th>Win bid</th>
              <th>Floor</th>
              <th>Cleared</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const clearedOk = r.cleared === true;
              const id = String(r.id ?? "");
              const wb = Number(r.winning_bid);
              const open = expanded === id;
              const isFlash = flashIds.current.has(id);
              return (
                <Fragment key={id}>
                  <tr
                    onClick={() => setExpanded(open ? null : id)}
                    style={{
                      cursor: "pointer",
                      borderLeft: `4px solid ${clearedOk ? C.green : C.red}`,
                      animation: isFlash ? "auctionFlash 1.8s ease-out 1" : undefined,
                      background: isFlash ? "rgba(74, 158, 255, 0.12)" : undefined
                    }}
                  >
                    <td style={{ fontSize: 10, whiteSpace: "nowrap" }} title={String(r.created_at ?? "")}>
                      {relTime(String(r.created_at ?? ""))}
                    </td>
                    <td style={{ fontFamily: "ui-monospace,monospace", fontSize: 10 }}>
                      {String(r.auction_id ?? "").slice(0, 8)}
                    </td>
                    <td style={{ fontSize: 10 }}>{String(r.publisher_domain ?? "—")}</td>
                    <td style={{ fontSize: 10 }}>{String(r.ad_unit_name ?? "—")}</td>
                    <td
                      style={{ fontSize: 9, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}
                      title={String(r.page_url ?? "")}
                    >
                      {String(r.page_url ?? "—").slice(0, 40)}
                    </td>
                    <td>{String(r.bid_count ?? "")}</td>
                    <td style={{ color: bidColor(wb), fontWeight: 700 }}>${Number.isFinite(wb) ? wb.toFixed(4) : "—"}</td>
                    <td style={{ fontSize: 10 }}>{String(r.floor_price ?? "—")}</td>
                    <td>{clearedOk ? "✓" : "✗"}</td>
                  </tr>
                  {open && (
                    <tr style={{ background: "#0c1018" }}>
                      <td colSpan={9} style={{ fontSize: 11, padding: 12 }}>
                        <div style={{ marginBottom: 8 }}>
                          <strong style={{ color: C.muted }}>URL:</strong>{" "}
                          <span style={{ wordBreak: "break-all" }}>{String(r.page_url ?? "—")}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <strong style={{ color: C.muted }}>User agent:</strong> {String(r.user_agent ?? "—")}
                        </div>
                        {r.is_ivt === true ? (
                          <div style={{ marginBottom: 8, color: C.red, fontWeight: 700 }}>
                            Flagged IVT — included because IVT-only filter or row metadata
                          </div>
                        ) : null}
                        {r.creative_image_url ? (
                          <div>
                            <strong style={{ color: C.muted }}>Creative:</strong>{" "}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={String(r.creative_image_url)} alt="" style={{ maxHeight: 80, marginTop: 6, borderRadius: 4 }} />
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <style>{`
          @keyframes auctionFlash {
            0% { background: rgba(74, 158, 255, 0.35); }
            100% { background: transparent; }
          }
        `}</style>
        {rows.length === 0 && !error && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", padding: 16, margin: 0 }}>No rows for this filter.</p>
        )}
      </div>
    </div>
  );
}
