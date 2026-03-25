"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Rule = {
  id: string;
  name: string;
  floor_cpm: string;
  applies_to_sizes: string[] | null;
  applies_to_env: string | null;
  active: boolean;
  rule_type?: string | null;
};

const C = {
  bgCard: "#f8f9fa",
  border: "#e2e8f0",
  textMuted: "#718096",
  textBright: "#e8f0f8",
  blue: "#4a9eff",
  green: "#2ecc71",
  yellow: "#ffd32a",
  accent: "#0066cc"
};

const SIZE_OPTS = ["300x250", "728x90", "160x600", "320x50", "300x600", "970x250"];

type Pub = { id: string; name: string; status: string };
type InvUnit = {
  id: string;
  name: string;
  publisher_id: string;
  sizes: string[];
  environment: string;
  ad_type?: string;
};

export default function AdminPricingPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [name, setName] = useState("Global Floor — Display");
  const [floor, setFloor] = useState("0.50");
  const [sizesPick, setSizesPick] = useState<Record<string, boolean>>({ "300x250": true, "728x90": false });
  const [env, setEnv] = useState<string>("all");
  const [ruleType, setRuleType] = useState<"unified" | "first_look">("unified");
  const [busy, setBusy] = useState<string | null>(null);

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [inv, setInv] = useState<InvUnit[]>([]);
  const [testPub, setTestPub] = useState("");
  const [testUnit, setTestUnit] = useState("");
  const [testSizes, setTestSizes] = useState("300x250");
  const [testEnv, setTestEnv] = useState("web");
  const [floorPreview, setFloorPreview] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/pricing-rules", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }
      setRules(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const [p, i] = await Promise.all([
        fetch("/api/publishers", { credentials: "include" }),
        fetch("/api/inventory", { credentials: "include" })
      ]);
      const pj = await p.json();
      const ij = await i.json();
      if (p.ok && Array.isArray(pj)) {
        const act = pj.filter((x: Pub) => x.status === "active");
        setPubs(act);
        if (act.length) setTestPub((t) => t || act[0].id);
      }
      if (i.ok && Array.isArray(ij)) setInv(ij);
    })();
  }, []);

  useEffect(() => {
    if (!testPub || !inv.length) return;
    const nu = inv.filter((u) => u.publisher_id === testPub);
    if (nu.length && !nu.some((u) => u.id === testUnit)) setTestUnit(nu[0].id);
  }, [testPub, inv, testUnit]);

  function openNew() {
    setName("New rule");
    setFloor("0.50");
    setSizesPick({ "300x250": true, "728x90": false, "160x600": false, "320x50": false, "300x600": false, "970x250": false });
    setEnv("all");
    setRuleType("unified");
    setEditRule(null);
    setModal(true);
  }

  function openEdit(r: Rule) {
    setEditRule(r);
    setName(r.name);
    setFloor(String(r.floor_cpm));
    const sp: Record<string, boolean> = {};
    for (const s of SIZE_OPTS) sp[s] = r.applies_to_sizes?.includes(s) ?? false;
    setSizesPick(sp);
    setEnv(r.applies_to_env ?? "all");
    setRuleType((r.rule_type as "unified" | "first_look") ?? "unified");
    setModal(true);
  }

  async function saveRule(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const picked = SIZE_OPTS.filter((s) => sizesPick[s]);
    const body = {
      name,
      floor_cpm: Number(floor),
      applies_to_sizes: picked.length ? picked : null,
      applies_to_env: env === "all" ? "all" : env,
      rule_type: ruleType,
      active: true
    };
    const url = editRule ? `/api/pricing-rules/${editRule.id}` : "/api/pricing-rules";
    const method = editRule ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setModal(false);
    await load();
  }

  async function toggleActive(r: Rule) {
    setBusy(r.id);
    await fetch(`/api/pricing-rules/${r.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active })
    });
    await load();
    setBusy(null);
  }

  async function removeRule(id: string) {
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/pricing-rules/${id}`, { method: "DELETE", credentials: "include" });
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.textBright }}>Yield Optimization &amp; Pricing Rules</div>
        <button type="button" onClick={openNew}>
          New Rule
        </button>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.textMuted,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 12
        }}
      >
        UNIFIED PRICING RULES ({rules.length})
      </div>
      {error && <p style={{ color: "#ff4757", fontSize: 12 }}>{error}</p>}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20, overflow: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.8fr 0.6fr",
            gap: 8,
            padding: "8px 12px",
            borderBottom: `1px solid ${C.border}`,
            fontSize: 10,
            fontWeight: 700,
            color: C.textMuted,
            minWidth: 800
          }}
        >
          <div>RULE NAME</div>
          <div>TYPE</div>
          <div>FLOOR CPM</div>
          <div>SIZES</div>
          <div>ENV</div>
          <div>ACTIVE</div>
          <div />
        </div>
        {rules.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 0.8fr 0.6fr",
              gap: 8,
              padding: "10px 12px",
              borderBottom: `1px solid ${C.border}08`,
              alignItems: "center",
              fontSize: 11,
              minWidth: 800
            }}
          >
            <div style={{ fontWeight: 600, color: C.textBright }}>{r.name}</div>
            <div style={{ fontSize: 10, color: C.accent }}>{r.rule_type ?? "unified"}</div>
            <div style={{ fontWeight: 800, color: C.yellow }}>${Number(r.floor_cpm).toFixed(2)}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{(r.applies_to_sizes ?? []).join(", ") || "all"}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{r.applies_to_env ?? "—"}</div>
            <div>
              <button type="button" disabled={busy === r.id} style={{ fontSize: 10 }} onClick={() => toggleActive(r)}>
                {r.active ? "On" : "Off"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="link-button" style={{ fontSize: 10 }} onClick={() => openEdit(r)}>
                Edit
              </button>
              <button type="button" className="link-button" style={{ fontSize: 10, color: "#ff4757" }} onClick={() => removeRule(r.id)}>
                Del
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.blue, marginBottom: 10 }}>Floor testing tool</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 10, color: C.textMuted }}>Publisher</label>
            <select value={testPub} onChange={(e) => setTestPub(e.target.value)} style={{ width: "100%" }}>
              {pubs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: C.textMuted }}>Ad unit</label>
            <select value={testUnit} onChange={(e) => setTestUnit(e.target.value)} style={{ width: "100%" }}>
              {inv
                .filter((u) => u.publisher_id === testPub)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: C.textMuted }}>Sizes (comma)</label>
            <input value={testSizes} onChange={(e) => setTestSizes(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: C.textMuted }}>Environment</label>
            <select value={testEnv} onChange={(e) => setTestEnv(e.target.value)}>
              <option value="web">web</option>
              <option value="app">app</option>
              <option value="ctv">ctv</option>
            </select>
          </div>
          <button
            type="button"
            onClick={async () => {
              setFloorPreview(null);
              const u = inv.find((x) => x.id === testUnit);
              const sp = new URLSearchParams({
                publisherId: testPub,
                adUnitId: testUnit,
                sizes: testSizes,
                environment: testEnv,
                ...(u?.ad_type ? { adType: u.ad_type } : {})
              });
              const res = await fetch(`/api/pricing/floor-preview?${sp}`, { credentials: "include" });
              const j = await res.json();
              setFloorPreview(j);
            }}
          >
            Evaluate
          </button>
        </div>
        {floorPreview && (
          <pre style={{ marginTop: 12, fontSize: 10, color: C.yellow, whiteSpace: "pre-wrap", background: "#0a0e12", padding: 12, borderRadius: 6 }}>
            {JSON.stringify(floorPreview, null, 2)}
          </pre>
        )}
      </div>

      <div
        style={{
          marginTop: 24,
          background: C.bgCard,
          border: "1px solid #ff6b9d44",
          borderRadius: 8,
          padding: 16,
          backgroundImage: "linear-gradient(135deg,#f8f9fa,#1a0f1f)"
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b9d", marginBottom: 8 }}>✦ AI Dynamic Floor Pricing</div>
        <p style={{ fontSize: 11, color: C.textMuted, margin: "0 0 12px" }}>
          Rules above are applied in the auction engine: effective floor is the maximum of ad unit floor, OpenRTB bidfloor, and matching active pricing rules.
        </p>
      </div>

      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setModal(false)}
        >
          <div className="card" style={{ width: 440, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 12 }}>{editRule ? "Edit rule" : "+ New floor rule"}</div>
            <form onSubmit={saveRule}>
              <label style={{ fontSize: 10, color: C.textMuted }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: C.textMuted }}>Floor CPM (USD)</label>
              <input type="number" step="0.0001" value={floor} onChange={(e) => setFloor(e.target.value)} required />
              <div style={{ height: 10 }} />
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>Applies to sizes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SIZE_OPTS.map((s) => (
                  <label key={s} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="checkbox" checked={sizesPick[s]} onChange={(e) => setSizesPick((p) => ({ ...p, [s]: e.target.checked }))} />
                    {s}
                  </label>
                ))}
              </div>
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: C.textMuted }}>Environment</label>
              <select value={env} onChange={(e) => setEnv(e.target.value)}>
                <option value="all">All</option>
                <option value="web">Web</option>
                <option value="app">Mobile App</option>
                <option value="ctv">CTV</option>
              </select>
              <div style={{ height: 10 }} />
              <label style={{ fontSize: 10, color: C.textMuted }}>Rule type</label>
              <select value={ruleType} onChange={(e) => setRuleType(e.target.value as "unified" | "first_look")}>
                <option value="unified">Unified</option>
                <option value="first_look">First look</option>
              </select>
              <div style={{ height: 14, display: "flex", gap: 8 }}>
                <button type="submit">Save</button>
                <button type="button" className="secondary" onClick={() => setModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
