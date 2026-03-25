"use client";

import { useEffect, useMemo, useState } from "react";

type Unit = { id: string; name: string; publisher_id: string; sizes: string[]; floor_price: string };

export default function PublisherTagsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState("");
  const [pubId, setPubId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"mde" | "prebid">("mde");
  const [lazyLoad, setLazyLoad] = useState(true);
  const [prebidJson, setPrebidJson] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/inventory", { credentials: "include" });
      const j = await r.json();
      if (r.ok && Array.isArray(j)) {
        setUnits(j);
        if (j.length) {
          setUnitId((u) => u || j[0].id);
          setPubId(j[0].publisher_id ?? null);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const u = units.find((x) => x.id === unitId);
    if (u?.publisher_id) setPubId(u.publisher_id);
  }, [unitId, units]);

  useEffect(() => {
    if (!pubId || !unitId || tab !== "prebid") return;
    (async () => {
      const r = await fetch(`/api/prebid/config?publisherId=${encodeURIComponent(pubId)}&unitId=${encodeURIComponent(unitId)}`);
      const j = await r.json();
      setPrebidJson(r.ok ? JSON.stringify(j, null, 2) : JSON.stringify(j));
    })();
  }, [pubId, unitId, tab]);

  const unit = units.find((u) => u.id === unitId);
  const divId = unit ? `mde-${unit.id.replace(/-/g, "")}` : "";

  const tag = useMemo(() => {
    if (!unit || !pubId) return "// Select an ad unit";
    const sz = unit.sizes?.[0] ?? "300x250";
    const [w, h] = sz.split("x");
    const floor = Number(unit.floor_price ?? 0.5);
    const lazy = lazyLoad ? `        lazyLoad: { marginPercent: 200, mobileScaling: 1.5 },\n` : "";
    return `<!-- MyExchange MDE · ${unit.name} -->
<div id="${divId}" style="min-width:${w}px;min-height:${h}px"></div>
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
${lazy}    });
    mde.enableServices();
    mde.display("${divId}");
  });
})();
</script>
<script async src="https://exchange.adsgupta.com/mde.js"></script>`;
  }, [unit, pubId, divId, lazyLoad]);

  const testSrcDoc = useMemo(() => {
    if (!unit || !pubId) return "<!DOCTYPE html><html><body>Select unit</body></html>";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>MDE test</title></head><body style="margin:16px;background:#ffffff;color:#1a202c;font-family:system-ui,sans-serif;">
${tag}
</body></html>`;
  }, [tag, unit, pubId]);

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Tags &amp; Prebid</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Generate your <code>mde.js</code> placement or copy the Prebid.js config (loads <code>mde-prebid.js</code>).
      </p>

      <button type="button" onClick={() => setModalOpen(true)} style={{ marginTop: 12 }}>
        Open tag generator
      </button>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000c",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setModalOpen(false)}
        >
          <div className="card" style={{ width: "min(920px, 98vw)", maxHeight: "92vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <strong>Tag generator</strong>
              <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button type="button" className={tab === "mde" ? "" : "secondary"} onClick={() => setTab("mde")}>
                MDE tag
              </button>
              <button type="button" className={tab === "prebid" ? "" : "secondary"} onClick={() => setTab("prebid")}>
                Prebid integration
              </button>
            </div>

            <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Ad unit</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} style={{ width: "100%", marginBottom: 12 }}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {tab === "mde" && (
              <>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <input type="checkbox" checked={lazyLoad} onChange={(e) => setLazyLoad(e.target.checked)} />
                  Lazy load
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(tag);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied" : "Copy tag"}
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
                    maxHeight: 240,
                    whiteSpace: "pre-wrap",
                    border: "1px solid var(--border)"
                  }}
                >
                  {tag}
                </pre>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Test in iframe:</p>
                <iframe title="mde-test" srcDoc={testSrcDoc} style={{ width: "100%", height: 280, border: "1px solid var(--border)", borderRadius: 4, background: "#fff" }} />
              </>
            )}

            {tab === "prebid" && (
              <>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  From <code>/api/prebid/config</code>. Include <code>mde-prebid.js</code> before <code>pbjs.requestBids</code>.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(prebidJson);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre
                  style={{
                    background: "#0c1018",
                    borderRadius: 6,
                    padding: 14,
                    fontSize: 10,
                    color: "#4a9eff",
                    overflow: "auto",
                    maxHeight: 360,
                    whiteSpace: "pre-wrap",
                    border: "1px solid var(--border)"
                  }}
                >
                  {prebidJson || "// Loading…"}
                </pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
