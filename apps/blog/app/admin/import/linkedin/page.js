"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImportLinkedInPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/import/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Import failed");
        setLoading(false);
        return;
      }
      setResult(data);
      setUrl("");
    } catch {
      setError("Import failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Sync LinkedIn</h1>
      <p className="hero-description" style={{ marginBottom: "1.5rem" }}>
        Paste a LinkedIn article URL. The system will extract title, content, and images and create a CMS post.
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>LinkedIn article URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/pulse/..."
            required
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {result && (
          <p style={{ color: "var(--ads-accent)" }}>
            Post created: <Link href={`/admin/posts/${result.id}/edit`}>{result.slug}</Link>
          </p>
        )}
        <button type="submit" disabled={loading} className="header-btn header-btn-primary">
          {loading ? "Importing…" : "Sync LinkedIn"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>
        <Link href="/admin/posts">← Post Manager</Link>
      </p>
    </div>
  );
}
