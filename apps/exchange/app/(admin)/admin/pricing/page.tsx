"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Rule = {
  id: string;
  name: string;
  floor_cpm: string;
  applies_to_sizes: string[] | null;
  applies_to_env: string | null;
  active: boolean;
};

const C = {
  bgCard: "#0f1419",
  border: "#1a2332",
  textMuted: "#5a6d82",
  textBright: "#e8f0f8",
  blue: "#4a9eff",
  green: "#2ecc71",
  yellow: "#ffd32a",
  accent: "#00d4aa"
};

export default function AdminPricingPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Global Floor — Display");
  const [floor, setFloor] = useState("0.50");

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

  async function addRule(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/pricing-rules", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, floor_cpm: Number(floor), applies_to_sizes: ["300x250", "728x90"] })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setName("");
    setFloor("0.50");
    await load();
  }

  async function removeRule(id: string) {
    await fetch(`/api/pricing-rules/${id}`, { method: "DELETE", credentials: "include" });
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.textBright }}>Yield Optimization &amp; Pricing Rules</div>
        <span style={{ fontSize: 11, color: C.textMuted }}>Via /api/pricing-rules</span>
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
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 0.6fr",
            gap: 8,
            padding: "8px 12px",
            borderBottom: `1px solid ${C.border}`,
            fontSize: 10,
            fontWeight: 700,
            color: C.textMuted
          }}
        >
          <div>RULE NAME</div>
          <div>FLOOR CPM</div>
          <div>SIZES</div>
          <div>ENV</div>
          <div />
        </div>
        {rules.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 0.6fr",
              gap: 8,
              padding: "10px 12px",
              borderBottom: `1px solid ${C.border}08`,
              alignItems: "center",
              fontSize: 11
            }}
          >
            <div style={{ fontWeight: 600, color: C.textBright }}>{r.name}</div>
            <div style={{ fontWeight: 800, color: C.yellow }}>${Number(r.floor_cpm).toFixed(2)}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{(r.applies_to_sizes ?? []).join(", ") || "—"}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{r.applies_to_env ?? "—"}</div>
            <button type="button" className="link-button" onClick={() => removeRule(r.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addRule} className="card" style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 12 }}>+ New floor rule</div>
        <label style={{ fontSize: 10, color: C.textMuted }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <div style={{ height: 10 }} />
        <label style={{ fontSize: 10, color: C.textMuted }}>Floor CPM (USD)</label>
        <input
          type="number"
          step="0.0001"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          required
        />
        <div style={{ height: 14 }} />
        <button type="submit">Save rule</button>
      </form>

      <div
        style={{
          marginTop: 24,
          background: C.bgCard,
          border: "1px solid #ff6b9d44",
          borderRadius: 8,
          padding: 16,
          backgroundImage: "linear-gradient(135deg,#0f1419,#1a0f1f)"
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b9d", marginBottom: 8 }}>✦ AI Dynamic Floor Pricing</div>
        <p style={{ fontSize: 11, color: C.textMuted, margin: "0 0 12px" }}>
          MDE can adjust floors per impression using auction signals. Wire ML here when ready.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            ["Avg Floor Lift", "+34%", C.green],
            ["Revenue Uplift", "+18.7%", C.yellow],
            ["Model Confidence", "94.2%", C.accent]
          ].map(([l, v, c]) => (
            <div
              key={String(l)}
              style={{
                background: String(c) + "10",
                border: `1px solid ${String(c)}33`,
                borderRadius: 6,
                padding: 10,
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: 10, color: C.textMuted }}>{String(l)}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: String(c) }}>{String(v)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
