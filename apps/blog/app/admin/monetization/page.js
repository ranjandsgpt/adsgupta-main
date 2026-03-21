"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminMonetizationPage() {
  const [script, setScript] = useState("");
  const [position, setPosition] = useState("after_paragraph_3");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/monetization")
      .then((r) => r.ok ? r.json() : [])
      .then((list) => {
        const first = list && list[0];
        if (first) {
          setScript(first.script || "");
          setPosition(first.position || "after_paragraph_3");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, position }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Saved. Script will be injected after paragraph 3 in articles.");
    } catch {
      setMessage("Failed to save.");
    }
    setSaving(false);
  }

  if (loading) return <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>;

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Monetization Settings</h1>
      <p className="hero-description" style={{ marginBottom: "1.5rem" }}>
        Script or HTML added here is injected into each article after paragraph 3 (placeholder: <code id="adsgupta-monetization-slot">adsgupta-monetization-slot</code>).
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "720px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Script / HTML / Ad tag</span>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={10}
            placeholder="<script>...</script> or <div>...</div>"
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "monospace" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Position</span>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <option value="after_paragraph_3">After paragraph 3</option>
          </select>
        </label>
        {message && <p style={{ color: "var(--ads-accent)" }}>{message}</p>}
        <button type="submit" disabled={saving} className="header-btn header-btn-primary">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>
        <Link href="/admin/posts">← Post Manager</Link>
      </p>
    </div>
  );
}
