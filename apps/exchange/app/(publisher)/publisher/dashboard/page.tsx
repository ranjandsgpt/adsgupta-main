"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

import { PublisherAnalyticsTab } from "@/components/publisher-analytics-tab";
import { IAB_STANDARD_SIZES } from "@/lib/iab-sizes";

type Publisher = {
  id: string;
  name: string;
  domain: string;
  contact_email: string | null;
  status: string;
};

type AdUnit = {
  id: string;
  name: string;
  sizes: string[];
  ad_type: string;
  environment: string;
  floor_price: string;
  status: string;
  impressions_today?: string;
  impressions_24h?: string;
  revenue_24h?: string;
};

type PublisherStats = {
  impressionsTotal: number;
  impressionsToday: number;
  revenueTotal: number;
  revenueToday: number;
  fillRate: number;
  activeUnits: number;
  ivtRateToday: number;
};

function buildTagSnippet(publisherId: string, unit: AdUnit) {
  const sizes = unit.sizes?.length ? unit.sizes : ["300x250"];
  const size = sizes[0] ?? "300x250";
  const [w, h] = size.split("x");
  const floor = Number(unit.floor_price ?? 0.5);
  const unitId = unit.id;
  const sizesJson = JSON.stringify(sizes);
  return `<!-- MDE Publisher Tag | ${unit.name} | exchange.adsgupta.com -->
<div id='mde-${unitId}' style='width:${w}px;height:${h}px;overflow:hidden;'></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${publisherId}'});
    mde.defineSlot({unitId:'${unitId}',div:'mde-${unitId}',sizes:${sizesJson},floor:${floor}});
    mde.enableServices();
    mde.display('mde-${unitId}');
  });
</script>
<script async src='https://exchange.adsgupta.com/mde.js'></script>`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cfg =
    s === "active"
      ? { bg: "#2ecc7122", border: "#2ecc7155", color: "#2ecc71", label: "Active" }
      : s === "suspended"
        ? { bg: "#ff475722", border: "#ff475755", color: "#ff4757", label: "Suspended" }
        : { bg: "#ffd32a22", border: "#ffd32a55", color: "#ffd32a", label: "Pending" };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        padding: "4px 10px",
        borderRadius: 4,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color
      }}
    >
      {cfg.label}
    </span>
  );
}

function PublisherDashboardInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pub, setPub] = useState<Publisher | null>(null);
  const [stats, setStats] = useState<PublisherStats | null>(null);
  const [units, setUnits] = useState<AdUnit[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unitName, setUnitName] = useState("site_leaderboard");
  const [sizeSelection, setSizeSelection] = useState<string[]>(["300x250"]);
  const [adType, setAdType] = useState("display");
  const [env, setEnv] = useState("web");
  const [floor, setFloor] = useState("0.50");
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tagModalUnit, setTagModalUnit] = useState<AdUnit | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingFloor, setEditingFloor] = useState<{ unitId: string; value: string } | null>(null);
  const [tab, setTab] = useState<"overview" | "analytics" | "units" | "tags">("overview");

  const reloadUnits = useCallback(async (pid: string) => {
    const ir = await fetch(`/api/inventory?publisherId=${encodeURIComponent(pid)}`);
    if (ir.ok) setUnits((await ir.json()) as AdUnit[]);
  }, []);

  const reloadStats = useCallback(async (pid: string) => {
    const sr = await fetch(`/api/publisher-stats/${encodeURIComponent(pid)}`);
    if (!sr.ok) return;
    const j = (await sr.json()) as Record<string, unknown>;
    setStats({
      impressionsTotal: Number(j.impressionsTotal ?? 0),
      impressionsToday: Number(j.impressionsToday ?? 0),
      revenueTotal: Number(j.revenueTotal ?? 0),
      revenueToday: Number(j.revenueToday ?? 0),
      fillRate: Number(j.fillRate ?? 0),
      activeUnits: Number(j.activeUnits ?? 0),
      ivtRateToday: Number(j.ivtRateToday ?? 0)
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [res, st] = await Promise.all([
          fetch(`/api/publishers/${id}`),
          fetch(`/api/publisher-stats/${encodeURIComponent(id)}`)
        ]);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(typeof data.error === "string" ? data.error : "Failed to load publisher");
          return;
        }
        setPub(data as Publisher);
        if (st.ok) {
          const j = (await st.json()) as Record<string, unknown>;
          setStats({
            impressionsTotal: Number(j.impressionsTotal ?? 0),
            impressionsToday: Number(j.impressionsToday ?? 0),
            revenueTotal: Number(j.revenueTotal ?? 0),
            revenueToday: Number(j.revenueToday ?? 0),
            fillRate: Number(j.fillRate ?? 0),
            activeUnits: Number(j.activeUnits ?? 0),
            ivtRateToday: Number(j.ivtRateToday ?? 0)
          });
        }
        if (data?.status === "active") {
          await reloadUnits(id);
        }
      } catch {
        if (!cancelled) setLoadError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reloadUnits]);

  function toggleSize(s: string) {
    setSizeSelection((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function createUnit(e: FormEvent) {
    e.preventDefault();
    if (!id || pub?.status !== "active") return;
    if (sizeSelection.length === 0) {
      setLoadError("Pick at least one IAB size");
      return;
    }
    setCreating(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publisher_id: id,
          name: unitName,
          sizes: sizeSelection,
          ad_type: adType,
          environment: env,
          floor_price: Number(floor)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(typeof data.error === "string" ? data.error : "Could not create ad unit");
        setCreating(false);
        return;
      }
      setUnits((u) => [...u, data as AdUnit]);
      setModalOpen(false);
      void reloadStats(id);
    } catch {
      setLoadError("Network error");
    }
    setCreating(false);
  }

  async function copyTag(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setLoadError("Clipboard not available");
    }
  }

  async function saveFloor(unit: AdUnit, value: string) {
    if (!id) return;
    setEditingFloor(null);
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setLoadError("Floor must be > 0");
      return;
    }
    const res = await fetch(`/api/inventory/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publisher_id: id, floor_price: n })
    });
    if (!res.ok) {
      setLoadError("Could not update floor");
      return;
    }
    const row = (await res.json()) as AdUnit | null;
    if (row) setUnits((u) => u.map((x) => (x.id === row.id ? row : x)));
  }

  async function setPaused(unit: AdUnit, paused: boolean) {
    if (!id) return;
    const res = await fetch(`/api/inventory/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publisher_id: id, status: paused ? "paused" : "active" })
    });
    if (!res.ok) {
      setLoadError("Could not update status");
      return;
    }
    const row = (await res.json()) as AdUnit | null;
    if (row) setUnits((u) => u.map((x) => (x.id === row.id ? row : x)));
    void reloadStats(id);
  }

  async function archiveUnit(unit: AdUnit) {
    if (!id || !confirm(`Remove (archive) ad unit “${unit.name}”?`)) return;
    const res = await fetch(`/api/inventory/${encodeURIComponent(unit.id)}?publisherId=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      setLoadError("Could not archive unit");
      return;
    }
    setUnits((u) => u.filter((x) => x.id !== unit.id));
    void reloadStats(id);
  }

  if (!id) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        Add <code>?id=</code> with your publisher UUID.{" "}
        <Link href="/publisher/register" style={{ color: "var(--accent)" }}>
          Register
        </Link>
      </p>
    );
  }

  if (loadError && !pub) {
    return <p style={{ color: "#ff4757" }}>{loadError}</p>;
  }

  if (!pub) {
    return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  const testHtml = tagModalUnit && id ? buildTagSnippet(id, tagModalUnit) : "";
  const testPage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MDE test — ${tagModalUnit?.name ?? "ad"}</title>
</head>
<body style="margin:24px;background:#0a0e17;color:#e8f0f8;font-family:system-ui,sans-serif">
  <p style="font-size:12px;color:#5a6d82">Local save-and-open test page · replace localhost with your tag host if needed.</p>
${testHtml ? `\n${testHtml}\n` : ""}
</body>
</html>`;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "var(--text-bright)", margin: 0, fontSize: 20 }}>
              {pub.name}
            </h1>
            <StatusBadge status={pub.status} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            {pub.domain}
            {pub.contact_email ? ` · ${pub.contact_email}` : ""}
          </div>
        </div>
      </div>

      {loadError && <p style={{ color: "#ff4757", fontSize: 12 }}>{loadError}</p>}

      {pub.status === "pending" && (
        <div
          className="card"
          style={{
            borderColor: "#ffd32a55",
            marginBottom: 20,
            background: "#ffd32a10",
            color: "var(--text-muted)",
            fontSize: 13
          }}
        >
          <strong style={{ color: "#ffd32a" }}>Account pending activation by the exchange team.</strong>
          <p style={{ margin: "8px 0 0" }}>Tag generator will be available once activated.</p>
        </div>
      )}

      {pub.status === "suspended" && (
        <div
          className="card"
          style={{ borderColor: "#ff475755", marginBottom: 20, background: "#ff475710", fontSize: 13, color: "var(--text-muted)" }}
        >
          <strong style={{ color: "#ff4757" }}>Account suspended.</strong>
          <p style={{ margin: "8px 0 0" }}>Contact the exchange team to restore access.</p>
        </div>
      )}

      {pub.status === "active" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["overview", "analytics", "units", "tags"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? "" : "secondary"}
                style={{ textTransform: "capitalize" }}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && stats && (
            <div className="kpis" style={{ marginBottom: 20, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
              {[
                ["Total impressions", stats.impressionsTotal],
                ["Today impressions", stats.impressionsToday],
                ["Total revenue ($)", stats.revenueTotal.toFixed(4)],
                ["Fill rate %", `${stats.fillRate.toFixed(1)}%`],
                ["Active units", stats.activeUnits]
              ].map(([label, val]) => (
                <div key={String(label)} className="card">
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
                  <strong style={{ color: "var(--text-bright)" }}>{val}</strong>
                </div>
              ))}
            </div>
          )}

          {tab === "overview" && stats && (
            <div
              className="card"
              style={{
                marginBottom: 20,
                borderLeft: stats.ivtRateToday > 10 ? "4px solid #ff4757" : "4px solid var(--border)"
              }}
            >
              <div style={{ fontWeight: 800, color: "var(--text-bright)", marginBottom: 8 }}>Invalid traffic (IVT)</div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Estimated IVT share of today&apos;s auctions on your inventory:{" "}
                <strong style={{ color: "var(--text-bright)" }}>{stats.ivtRateToday.toFixed(1)}%</strong>.{" "}
                {stats.ivtRateToday > 10
                  ? "This exceeds the 10% guideline — review bot filtering, ad implementation, and referrers."
                  : "Within normal range. Continue monitoring as volume grows."}
              </p>
            </div>
          )}

          {tab === "analytics" && id && <PublisherAnalyticsTab publisherId={id} />}

          {tab === "tags" && id && (
            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                Generate MDE and Prebid snippets from the tag workspace.
              </p>
              <Link href="/publisher/tags" style={{ color: "var(--accent)", fontWeight: 700, display: "inline-block", marginTop: 10 }}>
                Open tag generator →
              </Link>
            </div>
          )}

          {tab === "units" && (
            <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 15, color: "var(--text-bright)", margin: 0, fontWeight: 800 }}>Ad units</h2>
            <button type="button" onClick={() => setModalOpen(true)}>
              Create New Ad Unit
            </button>
          </div>

          <div style={{ marginTop: 12, overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sizes</th>
                  <th>Type</th>
                  <th>Floor CPM</th>
                  <th>Status</th>
                  <th>Impressions (today)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{(u.sizes ?? []).join(", ")}</td>
                    <td>{u.ad_type}</td>
                    <td
                      style={{ cursor: "pointer", color: "var(--accent)" }}
                      onClick={() => setEditingFloor({ unitId: u.id, value: String(u.floor_price) })}
                    >
                      {editingFloor?.unitId === u.id ? (
                        <input
                          autoFocus
                          style={{ maxWidth: 100 }}
                          value={editingFloor.value}
                          onChange={(e) => setEditingFloor({ unitId: u.id, value: e.target.value })}
                          onBlur={(e) => saveFloor(u, e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveFloor(u, (e.target as HTMLInputElement).value);
                          }}
                        />
                      ) : (
                        u.floor_price
                      )}
                    </td>
                    <td>{u.status}</td>
                    <td>{u.impressions_today ?? "0"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button type="button" style={{ marginRight: 6 }} onClick={() => setTagModalUnit(u)}>
                        Get Tag
                      </button>
                      <button type="button" className="link-button" style={{ marginRight: 6 }} onClick={() => setPaused(u, u.status === "active")}>
                        {u.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button type="button" className="link-button" onClick={() => archiveUnit(u)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </>
          )}
        </>
      )}

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16
          }}
          onClick={() => setModalOpen(false)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, color: "#4a9eff", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>New ad unit</div>
            <form onSubmit={createUnit}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name *</label>
              <input value={unitName} onChange={(e) => setUnitName(e.target.value)} required />
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Sizes * (IAB, multi-select)</label>
              <div
                style={{
                  maxHeight: 160,
                  overflow: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 6,
                  display: "grid",
                  gap: 6
                }}
              >
                {IAB_STANDARD_SIZES.map((s) => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer" }}>
                    <input type="checkbox" checked={sizeSelection.includes(s)} onChange={() => toggleSize(s)} />
                    {s}
                  </label>
                ))}
              </div>
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Ad type *</label>
              <select value={adType} onChange={(e) => setAdType(e.target.value)}>
                <option value="display">display</option>
                <option value="video">video</option>
                <option value="native">native</option>
              </select>
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Environment *</label>
              <select value={env} onChange={(e) => setEnv(e.target.value)}>
                <option value="web">web</option>
                <option value="app">app</option>
                <option value="ctv">ctv</option>
              </select>
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Floor CPM *</label>
              <input value={floor} onChange={(e) => setFloor(e.target.value)} type="number" step="0.0001" min="0.0001" required />
              <div style={{ height: 16, display: "flex", gap: 8 }}>
                <button type="submit" disabled={creating}>
                  {creating ? "…" : "Create"}
                </button>
                <button type="button" className="link-button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tagModalUnit && id && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16
          }}
          onClick={() => setTagModalUnit(null)}
        >
          <div className="card" style={{ width: "100%", maxWidth: 640, maxHeight: "92vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, color: "var(--accent)", marginBottom: 10 }}>MDE tag · {tagModalUnit.name}</div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Paste before <code>&lt;/body&gt;</code>. Ensure the container <code>mde-{tagModalUnit.id}</code> is visible for lazy-loaded auctions.
            </p>
            <pre
              style={{
                fontSize: 10,
                overflow: "auto",
                padding: 12,
                background: "#0c1018",
                borderRadius: 6,
                border: "1px solid var(--border)",
                whiteSpace: "pre-wrap",
                maxHeight: 260
              }}
            >
              {testHtml}
            </pre>
            <button
              type="button"
              style={{ marginTop: 12, background: "#143d28", borderColor: "#2ecc7155", color: "#2ecc71" }}
              onClick={() => copyTag(testHtml)}
            >
              Copy tag
            </button>
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>Complete test HTML (save as .html and open locally)</div>
            <pre
              style={{
                fontSize: 10,
                padding: 12,
                background: "#0c1018",
                borderRadius: 6,
                border: "1px solid var(--border)",
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflow: "auto"
              }}
            >
              {testPage}
            </pre>
            <button type="button" className="link-button" style={{ marginTop: 8 }} onClick={() => setTagModalUnit(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {copied && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#143d28",
            border: "1px solid #2ecc7155",
            color: "#2ecc71",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            zIndex: 200,
            boxShadow: "0 8px 24px #000e"
          }}
        >
          Copied!
        </div>
      )}
    </div>
  );
}

export default function PublisherDashboardPage() {
  return (
    <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading…</p>}>
      <PublisherDashboardInner />
    </Suspense>
  );
}
