"use client";

import { useEffect, useState } from "react";

type Publisher = { id: string; name: string; domain: string };
type Unit = { id: string; name: string; publisher_id: string; sizes: string[]; floor_price: string };

export default function AdminTagsPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [pubId, setPubId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, u] = await Promise.all([
        fetch("/api/publishers", { credentials: "include" }),
        fetch("/api/inventory", { credentials: "include" })
      ]);
      const pj = await p.json();
      const uj = await u.json();
      if (p.ok && Array.isArray(pj) && pj.length) {
        setPublishers(pj);
        const firstPub = pj[0].id;
        setPubId((prev) => prev || firstPub);
      }
      if (u.ok && Array.isArray(uj)) {
        setUnits(uj);
      }
    })();
  }, []);

  useEffect(() => {
    if (!pubId || !units.length) return;
    const nu = units.filter((x) => x.publisher_id === pubId);
    if (nu.length && !nu.some((x) => x.id === unitId)) {
      setUnitId(nu[0].id);
    }
  }, [pubId, units, unitId]);

  const filtered = units.filter((u) => u.publisher_id === pubId);
  const unit = units.find((u) => u.id === unitId);

  const divId = unit ? `mde-${unit.id.replace(/-/g, "")}` : "";
  const tag =
    unit && pubId
      ? `<!-- MDE Ad Tag: ${unit.name} | exchange.adsgupta.com -->
<div id="${divId}" style="width:${(unit.sizes[0] ?? "300x250").split("x")[0]}px;height:${(unit.sizes[0] ?? "300x250").split("x")[1]}px;overflow:hidden;"></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${pubId}'});
    mde.defineSlot({unitId:'${unit.id}',div:'${divId}',sizes:${JSON.stringify(unit.sizes ?? ["300x250"])},floor:${Number(unit.floor_price)}});
    mde.enableServices();
    mde.display('${divId}');
  });
</script>
<script async src="https://exchange.adsgupta.com/mde.js"></script>`
      : "// Select publisher and unit";

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Tag Generator</h1>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Live embed from database selections.</p>
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
        </div>
        <div className="card" style={{ borderColor: "#00d4aa33" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
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
              maxHeight: 480,
              whiteSpace: "pre-wrap",
              border: "1px solid var(--border)"
            }}
          >
            {tag}
          </pre>
        </div>
      </div>
    </div>
  );
}
