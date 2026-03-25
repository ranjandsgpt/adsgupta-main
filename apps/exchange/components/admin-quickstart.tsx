"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Health = {
  checks?: { database?: { status?: string; latencyMs?: number } };
};

type Publisher = { id: string; name: string; domain: string; status: string };
type AdUnit = { id: string; name: string; publisher_id: string; sizes: string[]; floor_price: string; status: string };
type Campaign = { id: string; status: string; campaign_name?: string; name?: string };
type Creative = { id: string; campaign_id: string; status: string };

type BadgeTone = "green" | "yellow" | "red" | "gray";
function badgeStyle(tone: BadgeTone) {
  const cfg =
    tone === "green"
      ? { bg: "#2ecc7122", border: "#2ecc7155", color: "#2ecc71" }
      : tone === "yellow"
        ? { bg: "#ffd32a22", border: "#ffd32a55", color: "#b68000" }
        : tone === "red"
          ? { bg: "#ff475722", border: "#ff475755", color: "#ff4757" }
          : { bg: "#71809622", border: "#71809655", color: "#718096" };
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    padding: "4px 10px",
    borderRadius: 999,
    background: cfg.bg,
    border: `1px solid ${cfg.border}`,
    color: cfg.color
  };
}

function buildTagSnippet(pubId: string, unit: AdUnit) {
  const sizes = unit.sizes?.length ? unit.sizes : ["300x250"];
  const size = sizes[0] ?? "300x250";
  const [w, h] = size.split("x");
  const floor = Number(unit.floor_price ?? 0.5);
  const unitId = unit.id;
  return `<!-- MDE Publisher Tag | ${unit.name} | exchange.adsgupta.com -->
<div id='mde-${unitId}' style='width:${w}px;height:${h}px;overflow:hidden;'></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${pubId}'});
    mde.defineSlot({unitId:'${unitId}',div:'mde-${unitId}',sizes:['${size}'],floor:${floor}});
    mde.enableServices();
    mde.display('mde-${unitId}');
  });
</script>
<script async src='https://exchange.adsgupta.com/mde.js'></script>`;
}

export function AdminQuickstart({ secret }: { secret: string }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [publishersError, setPublishersError] = useState<string | null>(null);

  const [units, setUnits] = useState<AdUnit[]>([]);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [creativesError, setCreativesError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [e2e, setE2e] = useState<{
    passed: boolean;
    summary: string;
    steps: Array<{ step: string; status: "pass" | "fail" | "skip"; durationMs: number; detail: string }>;
  } | null>(null);
  const [e2eError, setE2eError] = useState<string | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [debugJson, setDebugJson] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/health", { cache: "no-store", credentials: "include" });
        const j = (await r.json()) as Health;
        if (cancelled) return;
        if (!r.ok) {
          setHealthError("Failed to load /api/health");
          return;
        }
        setHealth(j);
      } catch {
        if (!cancelled) setHealthError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/publishers", { cache: "no-store", credentials: "include" });
        const j = (await r.json()) as unknown;
        if (cancelled) return;
        if (!r.ok) {
          setPublishersError(typeof (j as any)?.error === "string" ? (j as any).error : "Failed to load publishers");
          return;
        }
        setPublishers(Array.isArray(j) ? (j as Publisher[]) : []);
      } catch {
        if (!cancelled) setPublishersError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/inventory", { cache: "no-store", credentials: "include" });
        const j = (await r.json()) as unknown;
        if (cancelled) return;
        if (!r.ok) {
          setUnitsError(typeof (j as any)?.error === "string" ? (j as any).error : "Failed to load inventory");
          return;
        }
        setUnits(Array.isArray(j) ? (j as AdUnit[]) : []);
      } catch {
        if (!cancelled) setUnitsError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [camR, crR] = await Promise.all([
          fetch("/api/campaigns", { cache: "no-store", credentials: "include" }),
          fetch("/api/creatives", { cache: "no-store", credentials: "include" })
        ]);
        const camJ = (await camR.json()) as unknown;
        const crJ = (await crR.json()) as unknown;
        if (cancelled) return;
        if (!camR.ok) setCampaignsError(typeof (camJ as any)?.error === "string" ? (camJ as any).error : "Failed to load campaigns");
        else setCampaigns(Array.isArray(camJ) ? (camJ as Campaign[]) : []);
        if (!crR.ok) setCreativesError(typeof (crJ as any)?.error === "string" ? (crJ as any).error : "Failed to load creatives");
        else setCreatives(Array.isArray(crJ) ? (crJ as Creative[]) : []);
      } catch {
        if (!cancelled) {
          setCampaignsError("Network error");
          setCreativesError("Network error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dbStatus = health?.checks?.database?.status ?? null;
  const dbOk = dbStatus === "healthy" || dbStatus === "degraded";

  const activePublishers = useMemo(() => publishers.filter((p) => String(p.status).toLowerCase() === "active"), [publishers]);
  const pendingPublishers = useMemo(() => publishers.filter((p) => String(p.status).toLowerCase() === "pending"), [publishers]);
  const firstActivePublisher = activePublishers[0] ?? null;

  const activeUnits = useMemo(() => units.filter((u) => String(u.status).toLowerCase() === "active"), [units]);
  const firstActiveUnit = useMemo(() => {
    if (!firstActivePublisher) return activeUnits[0] ?? null;
    return activeUnits.find((u) => u.publisher_id === firstActivePublisher.id) ?? activeUnits[0] ?? null;
  }, [activeUnits, firstActivePublisher]);

  const activeCampaigns = useMemo(() => campaigns.filter((c) => String(c.status).toLowerCase() === "active"), [campaigns]);
  const creativesByCampaign = useMemo(() => {
    const m = new Map<string, Creative[]>();
    for (const cr of creatives) {
      const list = m.get(cr.campaign_id) ?? [];
      list.push(cr);
      m.set(cr.campaign_id, list);
    }
    return m;
  }, [creatives]);

  const activeCampaignsWithCreatives = useMemo(() => {
    return activeCampaigns.filter((c) => (creativesByCampaign.get(c.id) ?? []).some((cr) => String(cr.status).toLowerCase() === "active"));
  }, [activeCampaigns, creativesByCampaign]);
  const activeCampaignsNoCreative = useMemo(() => {
    return activeCampaigns.filter((c) => (creativesByCampaign.get(c.id) ?? []).length === 0);
  }, [activeCampaigns, creativesByCampaign]);

  const tagSnippet = useMemo(() => {
    if (!firstActivePublisher || !firstActiveUnit) return null;
    return buildTagSnippet(firstActivePublisher.id, firstActiveUnit);
  }, [firstActivePublisher, firstActiveUnit]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function runE2e() {
    setRunning(true);
    setE2eError(null);
    setE2e(null);
    try {
      const r = await fetch(`/api/test/e2e?secret=${encodeURIComponent(secret)}`, { cache: "no-store", credentials: "include" });
      const j = (await r.json()) as any;
      if (!r.ok) {
        setE2eError(typeof j?.error === "string" ? j.error : "E2E test failed");
      } else {
        setE2e(j);
      }
    } catch (e) {
      setE2eError(e instanceof Error ? e.message : "Network error");
    } finally {
      setRunning(false);
    }
  }

  const auctionStep = e2e?.steps?.find((s) => s.step.toLowerCase().includes("run auction")) ?? null;
  const auctionFailed = auctionStep?.status === "fail";

  async function runAuctionDebug() {
    if (!firstActiveUnit) return;
    setDebugLoading(true);
    setDebugError(null);
    setDebugJson(null);
    try {
      const r = await fetch(
        `/api/debug/auction?adUnitId=${encodeURIComponent(firstActiveUnit.id)}&secret=${encodeURIComponent(secret)}`,
        { cache: "no-store", credentials: "include" }
      );
      const t = await r.text();
      if (!r.ok) {
        setDebugError(t || `HTTP ${r.status}`);
        return;
      }
      setDebugJson(t);
    } catch (e) {
      setDebugError(e instanceof Error ? e.message : "Network error");
    } finally {
      setDebugLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1050 }}>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Quick Start — Get Your First Ad Serving</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>Follow these steps to serve your first real ad</p>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>Step 1 — Database</strong>
              <span style={badgeStyle(dbOk ? "green" : "red")}>{dbOk ? "Database connected" : "Database not connected"}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {healthError ? healthError : dbOk ? `Status: ${dbStatus}` : "Database not connected — visit /api/db-init?secret=YOUR_SECRET"}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>Step 2 — Active Publisher</strong>
              {activePublishers.length > 0 ? (
                <span style={badgeStyle("green")}>{activePublishers.length} active publisher(s)</span>
              ) : pendingPublishers.length > 0 ? (
                <span style={badgeStyle("yellow")}>{pendingPublishers.length} publisher(s) pending</span>
              ) : (
                <span style={badgeStyle("red")}>No publishers yet</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {publishersError ? (
                publishersError
              ) : activePublishers.length > 0 ? (
                <>
                  First active publisher: <strong style={{ color: "var(--text-bright)" }}>{firstActivePublisher?.name}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>({firstActivePublisher?.domain})</span>
                </>
              ) : pendingPublishers.length > 0 ? (
                <>
                  Go to{" "}
                  <Link href="/admin/publishers" style={{ color: "var(--accent)", fontWeight: 800 }}>
                    /admin/publishers
                  </Link>{" "}
                  and activate one.
                </>
              ) : (
                <Link href="/publisher/register" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  Register a publisher →
                </Link>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>Step 3 — Active Ad Unit</strong>
              {activeUnits.length > 0 ? (
                <span style={badgeStyle("green")}>{activeUnits.length} active ad unit(s)</span>
              ) : (
                <span style={badgeStyle("red")}>No active ad units</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {unitsError ? (
                unitsError
              ) : activeUnits.length > 0 ? (
                <>
                  First active unit: <strong style={{ color: "var(--text-bright)" }}>{firstActiveUnit?.name}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>({(firstActiveUnit?.sizes ?? []).join(", ")})</span>
                </>
              ) : (
                <Link href="/admin/publishers" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  Go to Publishers →
                </Link>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>Step 4 — Active Campaign with Creative</strong>
              {activeCampaignsWithCreatives.length > 0 ? (
                <span style={badgeStyle("green")}>{activeCampaignsWithCreatives.length} active campaign(s) with creatives</span>
              ) : activeCampaignsNoCreative.length > 0 ? (
                <span style={badgeStyle("yellow")}>Campaign active but no creative uploaded</span>
              ) : (
                <span style={badgeStyle("red")}>No active campaigns</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {campaignsError || creativesError ? (
                `${campaignsError ?? ""}${campaignsError && creativesError ? " · " : ""}${creativesError ?? ""}`
              ) : activeCampaignsWithCreatives.length > 0 ? (
                <>
                  Your exchange is ready to bid. Active campaigns:{" "}
                  <strong style={{ color: "var(--text-bright)" }}>{activeCampaigns.length}</strong>
                </>
              ) : activeCampaignsNoCreative.length > 0 ? (
                <Link href="/demand/dashboard" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  Upload creative →
                </Link>
              ) : (
                <Link href="/demand/create" style={{ color: "var(--accent)", fontWeight: 800 }}>
                  Create campaign →
                </Link>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>Step 5 — Your Ad Tag</strong>
              <span style={badgeStyle(tagSnippet ? "green" : "gray")}>{tagSnippet ? "Tag ready" : "Waiting for active publisher + unit"}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Paste this into any HTML page and open it in a browser. Or test directly at{" "}
              <a href="/test-ad.html" style={{ color: "var(--accent)", fontWeight: 800 }}>
                exchange.adsgupta.com/test-ad.html
              </a>
              .
            </div>
            <div style={{ marginTop: 10 }}>
              <pre
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 11,
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                  maxHeight: 260
                }}
              >
                {tagSnippet ?? "// Activate a publisher and create an ad unit to generate your tag."}
              </pre>
              {tagSnippet && (
                <button type="button" style={{ marginTop: 10 }} onClick={() => void copy(tagSnippet)}>
                  {copied ? "Copied" : "Copy tag"}
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <strong>Step 6 — Run Integration Test</strong>
              {e2e ? <span style={badgeStyle(e2e.passed ? "green" : "yellow")}>{e2e.passed ? "Passed" : "Needs attention"}</span> : null}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Run the full end-to-end test suite (creates test records, runs an auction, verifies tracking).
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
              <button type="button" disabled={running || !secret} onClick={() => void runE2e()}>
                {running ? "Running…" : "Run Full Test →"}
              </button>
              {!secret ? <span style={{ fontSize: 11, color: "#ff4757" }}>DB_INIT_SECRET is not set on the server.</span> : null}
            </div>

            {e2eError && <p style={{ color: "#ff4757", fontSize: 12, marginTop: 10 }}>{e2eError}</p>}

            {e2e && (
              <div style={{ marginTop: 12 }}>
                {e2e.passed ? (
                  <div className="card" style={{ background: "#2ecc7112", borderColor: "#2ecc7155" }}>
                    <strong style={{ color: "#2ecc71" }}>Exchange is live! Your first auction ran successfully.</strong>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{e2e.summary}</div>
                  </div>
                ) : auctionFailed ? (
                  <div className="card" style={{ background: "#ffd32a12", borderColor: "#ffd32a55" }}>
                    <strong style={{ color: "#b68000" }}>Auction step failed</strong>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{auctionStep?.detail}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
                      <button type="button" className="secondary" disabled={debugLoading || !firstActiveUnit || !secret} onClick={() => void runAuctionDebug()}>
                        {debugLoading ? "Debugging…" : "Debug Auction →"}
                      </button>
                      {!firstActiveUnit ? (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No active ad unit found to debug.</span>
                      ) : null}
                    </div>
                    {debugError ? <div style={{ marginTop: 10, fontSize: 12, color: "#ff4757" }}>{debugError}</div> : null}
                    {debugJson ? (
                      <pre
                        style={{
                          marginTop: 10,
                          background: "var(--bg-input)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: 12,
                          fontSize: 10,
                          overflow: "auto",
                          maxHeight: 260,
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {debugJson}
                      </pre>
                    ) : null}
                  </div>
                ) : null}

                <div style={{ marginTop: 12, overflow: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e2e.steps.map((s) => (
                        <tr key={s.step}>
                          <td style={{ fontSize: 11 }}>{s.step}</td>
                          <td style={{ fontSize: 11 }}>{s.status}</td>
                          <td style={{ fontSize: 11 }}>{s.durationMs}ms</td>
                          <td style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

