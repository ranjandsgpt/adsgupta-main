"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Neural Philosophical",
  "Marketplace Protocols",
  "AdTech Infrastructure",
  "Revenue Engineering",
  "Programmatic Strategy",
  "Media Buying Systems",
];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [source, setSource] = useState("AdsGupta");
  const [external_url, setExternalUrl] = useState("");
  const [publish_date, setPublishDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((p) => {
        setPost(p);
        setTitle(p.title || "");
        setSlug(p.slug || "");
        setContent(p.content || "");
        setExcerpt(p.excerpt || "");
        setCategory(p.category || CATEGORIES[0]);
        setSource(p.source || "AdsGupta");
        setExternalUrl(p.external_url || "");
        setPublishDate(p.publish_date ? p.publish_date.slice(0, 10) : "");
        setStatus(p.status || "draft");
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          category,
          source,
          external_url: external_url || undefined,
          publish_date: publish_date || undefined,
          status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      router.refresh();
      setSaving(false);
    } catch {
      setError("Failed to save");
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--ads-text-muted)" }}>Loading…</p>;
  if (!post) return <p style={{ color: "var(--ads-text-muted)" }}>Post not found. <Link href="/admin/posts">Back to list</Link></p>;

  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Edit Article</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "720px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Title *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            required
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
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
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
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="header-btn"
            style={{ borderRadius: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Content (HTML or Markdown) *</span>
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
          <button type="submit" disabled={saving} className="header-btn header-btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
          <Link href={`/archives/${slug}`} target="_blank" rel="noreferrer" className="header-btn header-btn-ghost">View</Link>
          <Link href="/admin/posts" className="header-btn header-btn-ghost">Back to list</Link>
        </div>
      </form>
    </div>
  );
}
