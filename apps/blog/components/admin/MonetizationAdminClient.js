"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PLACEMENTS = [
  { id: "inline", label: "Inline (article body)" },
  { id: "header", label: "Header sticky" },
  { id: "footer", label: "Footer sticky" },
  { id: "sidebar", label: "Sidebar" },
];

export default function MonetizationAdminClient() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", placement: "inline", ad_code: "", active: true });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/ad-slots");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSlots(data.slots || []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSlot() {
    setErr("");
    try {
      if (editing) {
        const res = await fetch(`/api/admin/ad-slots/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/admin/ad-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      setEditing(null);
      setForm({ name: "", placement: "inline", ad_code: "", active: true });
      load();
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  }

  async function toggleActive(id, active) {
    await fetch(`/api/admin/ad-slots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this slot?")) return;
    await fetch(`/api/admin/ad-slots/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Monetization
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1rem" }}>
        Ad slots stored in Postgres. Inline placement is injected after paragraph 3 on article pages (when active).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem", padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--ads-text-muted)" }}>Total Revenue</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$0</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem", padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--ads-text-muted)" }}>This month</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$0</div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem", padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--ads-text-muted)" }}>CPM / Fill</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>— / —</div>
        </div>
      </div>

      {err && <p style={{ color: "#f87171", marginBottom: "0.75rem" }}>{err}</p>}

      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Ad slots</h2>
      {loading ? (
        <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>
      ) : slots.length === 0 ? (
        <p style={{ color: "var(--ads-text-muted)" }}>No slots yet. Use the form below (requires POSTGRES_URL).</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", marginBottom: "1rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Name</th>
              <th style={{ padding: "0.5rem" }}>Placement</th>
              <th style={{ padding: "0.5rem" }}>Active</th>
              <th style={{ padding: "0.5rem" }} />
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.5rem" }}>{s.name}</td>
                <td style={{ padding: "0.5rem" }}>{s.placement}</td>
                <td style={{ padding: "0.5rem" }}>
                  <button type="button" className="header-btn header-btn-ghost" style={{ padding: "0.2rem 0.5rem" }} onClick={() => toggleActive(s.id, s.active)}>
                    {s.active ? "On" : "Off"}
                  </button>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <button
                    type="button"
                    className="header-btn header-btn-ghost"
                    style={{ padding: "0.2rem 0.5rem" }}
                    onClick={() => {
                      setEditing(s.id);
                      setForm({
                        name: s.name,
                        placement: s.placement,
                        ad_code: s.ad_code || "",
                        active: s.active,
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="header-btn header-btn-ghost" style={{ padding: "0.2rem 0.5rem", color: "#f87171" }} onClick={() => remove(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.65rem", padding: "1rem", maxWidth: "640px" }}>
        <h3 style={{ marginTop: 0 }}>{editing ? "Edit slot" : "New slot"}</h3>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--ads-text-muted)" }}>Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.4rem" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--ads-text-muted)" }}>Placement</span>
          <select
            value={form.placement}
            onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
            style={{ display: "block", width: "100%", marginTop: "0.2rem", borderRadius: "0.4rem", padding: "0.4rem" }}
          >
            {PLACEMENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--ads-text-muted)" }}>HTML / JS ad code</span>
          <textarea
            value={form.ad_code}
            onChange={(e) => setForm((f) => ({ ...f, ad_code: e.target.value }))}
            rows={6}
            className="header-btn"
            style={{ display: "block", width: "100%", marginTop: "0.2rem", fontFamily: "monospace", borderRadius: "0.4rem", padding: "0.4rem" }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          Active
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="header-btn header-btn-primary" onClick={saveSlot}>
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              type="button"
              className="header-btn header-btn-ghost"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", placement: "inline", ad_code: "", active: true });
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </div>

      <pre
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem",
          background: "rgba(0,0,0,0.25)",
          borderRadius: "0.5rem",
          fontSize: "0.75rem",
          overflow: "auto",
        }}
      >
        {`<div id="adsgupta-monetization-slot"></div>`}
      </pre>

      <p style={{ marginTop: "1rem" }}>
        <Link href="/admin/posts">← Post Manager</Link>
      </p>
    </div>
  );
}
