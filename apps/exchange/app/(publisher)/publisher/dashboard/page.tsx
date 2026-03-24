"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

type Publisher = {
  id: string;
  name: string;
  domain: string;
  contact_email: string | null;
  status: string;
};

type AdUnit = { id: string; name: string; sizes: string[]; publisher_id?: string };

function PublisherDashboardInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pub, setPub] = useState<Publisher | null>(null);
  const [units, setUnits] = useState<AdUnit[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unitName, setUnitName] = useState("site_leaderboard");
  const [sizes, setSizes] = useState("300x250");
  const [creating, setCreating] = useState(false);
  const [createdUnit, setCreatedUnit] = useState<AdUnit | null>(null);

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
          const ir = await fetch(`/api/inventory?publisher_id=${encodeURIComponent(id)}`);
          if (ir.ok && !cancelled) {
            setUnits(await ir.json());
          }
        }
      } catch {
        if (!cancelled) setLoadError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
          sizes: sizes.split(",").map((s) => s.trim()),
          ad_type: "Display",
          environment: "Web",
          floor_price: 0.5
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not create ad unit");
        setCreating(false);
        return;
      }
      setCreatedUnit(data);
      setUnits((u) => [...u, data]);
    } catch {
      setLoadError("Network error");
    }
    setCreating(false);
  }

  if (!id) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        Missing <code>?id=</code> publisher ID.{" "}
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

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://exchange.adsgupta.com";

  const slotDiv =
    createdUnit &&
    `mde-slot-${createdUnit.id.replace(/-/g, "").slice(0, 12)}`;

  const embed =
    createdUnit &&
    `<script src="${origin}/mde.js"></script>
<script>
  window.mde = window.mde || {}; mde.cmd = mde.cmd || [];
  mde.cmd.push(function() {
    mde.init({ origin: "${origin}" });
    mde.defineSlot({
      div: "${slotDiv}",
      adUnitId: "${createdUnit.id}",
      sizes: ${JSON.stringify(createdUnit.sizes)}
    });
    mde.enableServices();
    mde.display("${slotDiv}");
  });
</script>
<div id="${slotDiv}" style="min-width:300px;min-height:250px;border:1px dashed #1a2332"></div>`;

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Publisher</h1>
      {loadError && (
        <p style={{ color: "#ff4757", fontSize: 12, marginBottom: 8 }}>{loadError}</p>
      )}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Publisher ID</div>
        <div
          style={{
            fontSize: 13,
            color: "var(--accent)",
            fontFamily: "monospace",
            wordBreak: "break-all"
          }}
        >
          {pub.id}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>Status</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: pub.status === "active" ? "#2ecc71" : "#ffd32a"
          }}
        >
          {pub.status}
        </div>
      </div>

      {pub.status === "pending" && (
        <div className="card" style={{ borderColor: "#ffd32a55" }}>
          <strong style={{ color: "#ffd32a" }}>Pending activation</strong>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
            Your publisher record is waiting for an exchange admin to activate it. Bookmark this URL to
            check back later.
          </p>
        </div>
      )}

      {pub.status === "active" && (
        <>
          <h2 style={{ fontSize: 14, color: "var(--text-bright)" }}>Create ad unit</h2>
          <form onSubmit={createUnit} className="card" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Unit name</label>
            <input value={unitName} onChange={(e) => setUnitName(e.target.value)} required />
            <div style={{ height: 10 }} />
            <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Sizes (comma-separated)</label>
            <input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="300x250" />
            <div style={{ height: 12 }} />
            <button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create ad unit"}
            </button>
          </form>

          {units.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
              {units.length} ad unit{units.length === 1 ? "" : "s"} on file.
            </div>
          )}

          {createdUnit && embed && (
            <div className="card" style={{ marginTop: 16, borderColor: "#00d4aa44" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
                Embed code
              </div>
              <pre
                style={{
                  fontSize: 10,
                  overflow: "auto",
                  padding: 12,
                  background: "#0c1018",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  whiteSpace: "pre-wrap"
                }}
              >
                {embed}
              </pre>
            </div>
          )}
        </>
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
