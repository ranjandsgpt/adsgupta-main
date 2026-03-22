"use client";

import { useEffect, useState } from "react";

const ACCENT = "#06b6d4";

export default function MediaLibraryClient() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/media");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message || "Load failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      await load();
    } catch (e) {
      setErr(e.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function onDelete(id) {
    if (!confirm("Delete this asset?")) return;
    const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) load();
    else setErr("Delete failed");
  }

  function copy(url) {
    navigator.clipboard.writeText(url).then(() => alert("URL copied"));
  }

  const filtered = items.filter((m) => {
    if (!q.trim()) return true;
    return (m.filename || "").toLowerCase().includes(q.trim().toLowerCase());
  });

  return (
    <section>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Media Library
      </h1>
      <p style={{ color: "var(--ads-text-muted)", marginBottom: "1rem" }}>Bucket: blog-media (public URLs)</p>

      {err && <p style={{ color: "#f87171", marginBottom: "0.75rem" }}>{err}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center" }}>
        <label className="header-btn header-btn-primary" style={{ cursor: uploading ? "wait" : "pointer" }}>
          {uploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={uploading} />
        </label>
        <input
          placeholder="Search filename"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="header-btn"
          style={{ borderRadius: "0.5rem", padding: "0.4rem 0.65rem", border: "1px solid rgba(255,255,255,0.12)", minWidth: "200px" }}
        />
      </div>

      {loading ? (
        <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.65rem",
                overflow: "hidden",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {m.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt_text || ""} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
              ) : (
                <div style={{ height: 120, background: "rgba(0,0,0,0.2)" }} />
              )}
              <div style={{ padding: "0.5rem 0.65rem", fontSize: "0.78rem" }}>
                <div style={{ wordBreak: "break-all", marginBottom: "0.35rem" }}>{m.filename || "file"}</div>
                <div style={{ color: "var(--ads-text-muted)" }}>{m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : "—"}</div>
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" className="header-btn header-btn-ghost" style={{ padding: "0.2rem 0.45rem", fontSize: "0.75rem" }} onClick={() => copy(m.url)}>
                    Copy URL
                  </button>
                  <button
                    type="button"
                    className="header-btn header-btn-ghost"
                    style={{ padding: "0.2rem 0.45rem", fontSize: "0.75rem", color: "#f87171" }}
                    onClick={() => onDelete(m.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ color: "var(--ads-text-muted)" }}>
          No media yet. Upload above (requires Supabase Storage bucket <code style={{ color: ACCENT }}>blog-media</code>).
        </p>
      )}
    </section>
  );
}
