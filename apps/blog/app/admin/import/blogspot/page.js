"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImportBlogspotPage() {
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
      const res = await fetch("/api/admin/import/blogspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Import failed");
        setLoading(false);
        return;
      }
      setResult(data);
      if (data.imported) setUrl("");
    } catch {
      setError("Import failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Import Blogspot</h1>
      <p className="hero-description" style={{ marginBottom: "1.5rem" }}>
        Enter a Blogspot post URL. The system will fetch the page, extract title, content, and publish date, convert HTML to markdown, and insert the post as a draft.
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Blogspot URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://....blogspot.com/..../post.html"
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", textTransform: "none" }}
          />
        </label>
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {result && (
          <p style={{ color: "var(--ads-accent)" }}>
            {result.imported ? `Imported 1 post.` : ""} {result.skipped ? `Skipped: ${result.skipped}.` : ""}
            {result.slug && (
              <span> <Link href={`/admin/posts`}>View in Post Manager</Link></span>
            )}
          </p>
        )}
        <button type="submit" disabled={loading} className="header-btn header-btn-primary">
          {loading ? "Importing…" : "Import Blogspot"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>
        <Link href="/admin/posts">← Post Manager</Link>
      </p>
    </div>
  );
}
