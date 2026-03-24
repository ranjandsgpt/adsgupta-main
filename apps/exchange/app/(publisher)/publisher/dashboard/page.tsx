"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";

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
};

const SIZES = ["300x250", "728x90", "160x600", "320x50", "300x600"] as const;

function buildTagSnippet(publisherId: string, unit: AdUnit) {
  const size = unit.sizes[0] ?? "300x250";
  const [w, h] = size.split("x");
  const floor = Number(unit.floor_price ?? 0.5);
  const divId = `mde-${unit.id.replace(/-/g, "")}`;
  return `<!-- MDE Ad Tag: ${unit.name} | exchange.adsgupta.com -->
<div id="${divId}" style="width:${w}px;height:${h}px;overflow:hidden;"></div>
<script>
  window.mde=window.mde||{cmd:[]};
  mde.cmd.push(function(){
    mde.init({networkCode:'${publisherId}'});
    mde.defineSlot({unitId:'${unit.id}',div:'${divId}',sizes:['${size}'],floor:${floor}});
    mde.enableServices();
    mde.display('${divId}');
  });
</script>
<script async src="https://exchange.adsgupta.com/mde.js"></script>`;
}

function PublisherDashboardInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pub, setPub] = useState<Publisher | null>(null);
  const [units, setUnits] = useState<AdUnit[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unitName, setUnitName] = useState("site_leaderboard");
  const [sizePick, setSizePick] = useState<string>(SIZES[0]);
  const [adType, setAdType] = useState("display");
  const [env, setEnv] = useState("web");
  const [floor, setFloor] = useState("0.50");
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tagModalUnit, setTagModalUnit] = useState<AdUnit | null>(null);
  const [copied, setCopied] = useState(false);

  const reloadUnits = useCallback(async (pid: string) => {
    const ir = await fetch(`/api/inventory?publisher_id=${encodeURIComponent(pid)}`);
    if (ir.ok) setUnits(await ir.json());
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/publishers/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error ?? "Failed to load publisher");
          return;
        }
        setPub(data);
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

  async function createUnit(e: FormEvent) {
    e.preventDefault();
    if (!id || pub?.status !== "active") return;
    setCreating(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publisher_id: id,
          name: unitName,
          sizes: [sizePick],
          ad_type: adType,
          environment: env,
          floor_price: Number(floor)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not create ad unit");
        setCreating(false);
        return;
      }
      setUnits((u) => [...u, data]);
      setModalOpen(false);
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

  if (!id) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        Add <code>?id=</code> with your publisher UUID.{" "}
        <a href="/publisher/register" style={{ color: "var(--accent)" }}>
          Register
        </a>
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

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Publisher dashboard</h1>
      {loadError && <p style={{ color: "#ff4757", fontSize: 12 }}>{loadError}</p>}

      {pub.status === "pending" && (
        <div
          className="card"
          style={{ borderColor: "#ffd32a55", marginBottom: 20, background: "#ffd32a08" }}
        >
          <strong style={{ color: "#ffd32a" }}>Account pending activation</strong>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
            The exchange team will activate your account. Once active, you can generate ad tags.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Publisher ID</div>
        <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all" }}>
          {pub.id}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>Domain · {pub.domain}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Contact · {pub.contact_email ?? "—"}</div>
      </div>

      {pub.status === "active" && (
        <>
          <div className="kpis" style={{ marginBottom: 20 }}>
            {["Total impressions", "Revenue", "Fill rate", "Active units"].map((label, i) => (
              <div key={label} className="card">
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
                <strong style={{ color: i === 3 ? "var(--accent)" : "var(--text-bright)" }}>
                  {i === 3 ? units.length : "—"}
                </strong>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Placeholder</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, color: "var(--text-bright)", margin: 0 }}>Ad units</h2>
            <button type="button" onClick={() => setModalOpen(true)}>
              Create New Ad Unit
            </button>
          </div>

          <div style={{ marginTop: 12, overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Floor CPM</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{(u.sizes ?? []).join(", ")}</td>
                    <td>{u.ad_type}</td>
                    <td>{u.floor_price}</td>
                    <td style={{ color: u.status === "active" ? "#2ecc71" : "#ffd32a" }}>{u.status}</td>
                    <td>
                      <button type="button" onClick={() => setTagModalUnit(u)}>
                        Get Tag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="card" style={{ width: "100%", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#4a9eff", marginBottom: 14 }}>▦ New ad unit</div>
            <form onSubmit={createUnit}>
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Name *</label>
              <input value={unitName} onChange={(e) => setUnitName(e.target.value)} required />
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Size *</label>
              <select value={sizePick} onChange={(e) => setSizePick(e.target.value)}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
              <label style={{ fontSize: 10, color: "var(--text-muted)" }}>Floor CPM</label>
              <input value={floor} onChange={(e) => setFloor(e.target.value)} type="number" step="0.0001" />
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
          <div className="card" style={{ width: "100%", maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>MDE tag · {tagModalUnit.name}</div>
            <pre
              style={{
                fontSize: 10,
                overflow: "auto",
                padding: 12,
                background: "#0c1018",
                borderRadius: 6,
                border: "1px solid var(--border)",
                whiteSpace: "pre-wrap",
                maxHeight: 280
              }}
            >
              {testHtml}
            </pre>
            <button type="button" style={{ marginTop: 12, background: "#143d28", borderColor: "#2ecc7155", color: "#2ecc71" }} onClick={() => copyTag(testHtml)}>
              {copied ? "Copied" : "Copy Tag"}
            </button>
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>Test HTML page</div>
            <pre
              style={{
                fontSize: 10,
                padding: 12,
                background: "#0c1018",
                borderRadius: 6,
                border: "1px solid var(--border)",
                whiteSpace: "pre-wrap"
              }}
            >
              {`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ad test</title></head><body style="background:#0a0e17;color:#fff;font-family:monospace">\n${testHtml}\n</body></html>`}
            </pre>
            <button type="button" className="link-button" style={{ marginTop: 8 }} onClick={() => setTagModalUnit(null)}>
              Close
            </button>
          </div>
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
