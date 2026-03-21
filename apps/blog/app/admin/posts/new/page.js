"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Neural Philosophical",
  "Marketplace Protocols",
  "AdTech Infrastructure",
  "Revenue Engineering",
  "Programmatic Strategy",
  "Media Buying Systems",
];

const SOURCES = ["LinkedIn", "Blogspot", "AdsGupta Intelligence"];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [source, setSource] = useState(SOURCES[2]);
  const [external_url, setExternalUrl] = useState("");
  const [publish_date, setPublishDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function slugFromTitle() {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }

  async function handleSubmit(e, status) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugFromTitle(),
          content,
          excerpt,
          category,
          source,
          external_url: external_url || undefined,
          publish_date: publish_date || undefined,
          status: status || "draft",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      const { id } = await res.json();
      router.push(`/admin/posts/${id}/edit`);
      router.refresh();
    } catch {
      setError("Failed to save");
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>New Article</h1>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "720px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Title *</span>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugFromTitle()); }}
            required
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugFromTitle()}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Source</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>External URL</span>
          <input
            type="url"
            value={external_url}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", textTransform: "none" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Publish date</span>
          <input
            type="date"
            value={publish_date}
            onChange={(e) => setPublishDate(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Content (Markdown or HTML) *</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={16}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "monospace" }}
          />
        </label>
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" disabled={saving} onClick={(e) => handleSubmit(e, "draft")} className="header-btn header-btn-ghost">
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button type="button" disabled={saving} onClick={(e) => handleSubmit(e, "published")} className="header-btn header-btn-primary">
            {saving ? "Publishing…" : "Publish"}
          </button>
          <Link href="/admin/posts" className="header-btn header-btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
