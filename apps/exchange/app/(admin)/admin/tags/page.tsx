"use client";

import { useEffect, useMemo, useState } from "react";

type Publisher = { id: string; name: string; domain: string; status: string };
type Unit = { id: string; name: string; publisher_id: string; sizes: string[]; floor_price: string };
type Camp = { id: string; campaign_name?: string; name?: string; advertiser_name?: string; status: string };

export default function AdminTagsPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [campaigns, setCampaigns] = useState<Camp[]>([]);
  const [pubId, setPubId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lazyLoad, setLazyLoad] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshSec, setRefreshSec] = useState(30);
  const [showSize, setShowSize] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedPb, setCopiedPb] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [tab, setTab] = useState<"mde" | "prebid">("mde");
  const [prebidCfg, setPrebidCfg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const [p, u, c] = await Promise.all([
        fetch("/api/publishers", { credentials: "include" }),
        fetch("/api/inventory", { credentials: "include" }),
        fetch("/api/campaigns", { credentials: "include" })
      ]);
      const pj = await p.json();
      const uj = await u.json();
      const cj = await c.json();
      if (p.ok && Array.isArray(pj)) {
        const act = pj.filter((x: Publisher) => x.status === "active");
        setPublishers(act);
        if (act.length) setPubId((prev) => prev || act[0].id);
      }
      if (u.ok && Array.isArray(uj)) setUnits(uj);
      if (c.ok && Array.isArray(cj)) setCampaigns(cj.filter((x: Camp) => x.status === "active"));
    })();
  }, []);

  useEffect(() => {
    if (!pubId || !units.length) return;
    const nu = units.filter((x) => x.publisher_id === pubId);
    if (nu.length && !nu.some((x) => x.id === unitId)) {
      setUnitId(nu[0].id);
    }
  }, [pubId, units, unitId]);

  useEffect(() => {
    if (!pubId || !unitId || tab !== "prebid") return;
    (async () => {
      const r = await fetch(`/api/prebid/config?publisherId=${encodeURIComponent(pubId)}&unitId=${encodeURIComponent(unitId)}`, {
        credentials: "include"
      });
      const j = await r.json();
      setPrebidCfg(r.ok ? JSON.stringify(j, null, 2) : JSON.stringify(j));
    })();
  }, [pubId, unitId, tab]);

  const filtered = units.filter((u) => u.publisher_id === pubId);
  const unit = units.find((u) => u.id === unitId);

  const divId = unit ? `mde-${unit.id.replace(/-/g, "")}` : "";
  const tag = useMemo(() => {
    if (!unit || !pubId) return "// Select publisher and ad unit";
    const sz = unit.sizes?.[0] ?? "300x250";
    const [w, h] = sz.split("x");
    const floor = Number(unit.floor_price ?? 0.5);
    const lazy = lazyLoad ? `        lazyLoad: { marginPercent: 200, mobileScaling: 1.5 },\n` : "";
    const ref = autoRefresh
      ? `        refresh: { interval: ${refreshSec}, maxRefreshes: 10, visibleOnly: true },\n`
      : "";
    return `<!-- MyExchange MDE · ${unit.name} -->
<div id="${divId}" style="min-width:${w}px;min-height:${h}px;${showSize ? "" : "overflow:hidden;"}"></div>
<script>
(function(){
  var mde = window.mde = window.mde || {};
  mde.cmd = mde.cmd || [];
  mde.cmd.push(function(){
    mde.init({ networkCode: "${pubId}" });
    mde.defineSlot({
      unitId: "${unit.id}",
      div: "${divId}",
      sizes: ${JSON.stringify(unit.sizes ?? ["300x250"])},
      floor: ${floor},
${lazy}${ref}    });
    mde.enableServices();
    mde.display("${divId}");
  });
})();
</script>
<script async src="https://exchange.adsgupta.com/mde.js"></script>`;
  }, [unit, pubId, divId, lazyLoad, autoRefresh, refreshSec, showSize]);

  const testSrcDoc = useMemo(() => {
    if (!unit || !pubId) return "<!DOCTYPE html><html><body>Select unit</body></html>";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>MDE test</title></head><body style="margin:16px;background:#0a0e17;color:#c8d6e5;font-family:system-ui,sans-serif;">
<h3 style="margin-top:0;font-size:14px;">Local test iframe</h3>
${tag}
<p style="font-size:11px;opacity:0.7;margin-top:12px;">If the tag does not execute, check browser console and mde.js availability.</p>
</body></html>`;
  }, [tag, unit, pubId]);

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Tag Generator</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Live embed from database selections · Prebid adapter config for MDE.</p>

      {campaigns.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>ACTIVE DEMAND PARTNERS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {campaigns.slice(0, 12).map((c) => (
              <span
                key={c.id}
                style={{
                  fontSize: 10,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#00d4aa18",
                  border: "1px solid #00d4aa44",
                  color: "#00d4aa"
                }}
              >
                {String(c.advertiser_name ?? c.campaign_name ?? c.name ?? c.id).slice(0, 24)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" className={tab === "mde" ? "" : "secondary"} onClick={() => setTab("mde")}>
          MDE tag
        </button>
        <button type="button" className={tab === "prebid" ? "" : "secondary"} onClick={() => setTab("prebid")}>
          Prebid Config
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px,320px) 1fr", gap: 20, marginTop: 16 }}>
        <div className="card">
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>CONFIGURATION</div>
          <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Publisher</label>
          <select
            value={pubId}
            onChange={(e) => {
              setPubId(e.target.value);
              setUnitId("");
            }}
          >
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.domain})
              </option>
            ))}
          </select>
          <div style={{ height: 10 }} />
          <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Ad unit</label>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            {filtered.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <div style={{ height: 10 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer" }}>
            <input type="checkbox" checked={lazyLoad} onChange={(e) => setLazyLoad(e.target.checked)} />
            Lazy load
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", marginTop: 6 }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          {autoRefresh && (
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Interval (sec)</label>
              <input type="number" min={10} value={refreshSec} onChange={(e) => setRefreshSec(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", marginTop: 8 }}>
            <input type="checkbox" checked={showSize} onChange={(e) => setShowSize(e.target.checked)} />
            Size display on container
          </label>
          <div style={{ height: 12 }} />
          <button type="button" onClick={() => setTestOpen(true)}>
            Test Tag
          </button>
        </div>
        <div className="card" style={{ borderColor: "#00d4aa33" }}>
          {tab === "mde" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)" }}>GENERATED TAG</span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(tag);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre
                style={{
                  background: "#0c1018",
                  borderRadius: 6,
                  padding: 14,
                  fontSize: 10,
                  color: "var(--accent)",
                  overflow: "auto",
                  maxHeight: 360,
                  whiteSpace: "pre-wrap",
                  border: "1px solid var(--border)"
                }}
              >
                {tag}
              </pre>
            </>
          )}
          {tab === "prebid" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4a9eff" }}>PREBID CONFIG · /api/prebid/config</span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(prebidCfg);
                    setCopiedPb(true);
                    setTimeout(() => setCopiedPb(false), 2000);
                  }}
                >
                  {copiedPb ? "Copied" : "Copy JSON"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 0 }}>
                From <code>/api/prebid/config</code>. Load <code>mde-prebid.js</code> before calling{" "}
                <code>pbjs.requestBids</code>.
              </p>
              <pre
                style={{
                  background: "#0c1018",
                  borderRadius: 6,
                  padding: 14,
                  fontSize: 10,
                  color: "#4a9eff",
                  overflow: "auto",
                  maxHeight: 420,
                  whiteSpace: "pre-wrap",
                  border: "1px solid var(--border)"
                }}
              >
                {prebidCfg || "// Loading…"}
              </pre>
            </>
          )}
        </div>
      </div>

      {testOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setTestOpen(false)}
        >
          <div className="card" style={{ width: "min(900px, 96vw)", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <strong>Test tag preview</strong>
              <button type="button" className="secondary" onClick={() => setTestOpen(false)}>
                Close
              </button>
            </div>
            <iframe title="test" srcDoc={testSrcDoc} style={{ width: "100%", height: 420, border: "1px solid var(--border)", borderRadius: 4, background: "#fff" }} />
          </div>
        </div>
      )}
    </div>
  );
}
