"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "archived", label: "Archived" },
];

export default function PostManagerClient({ initialPosts, tab, q }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  const currentTab = tab || "all";
  const searchQ = q || "";

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const ids = posts.map((p) => String(p.id));
    if (selected.size === ids.length) setSelected(new Set());
    else setSelected(new Set(ids));
  }

  async function runBulk(action) {
    if (!selected.size) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} post(s)?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/posts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], action }),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      setSelected(new Set());
      router.refresh();
    } catch {
      alert("Bulk action failed");
    }
    setBusy(false);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  async function handleDuplicate(id) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      router.push(`/admin/posts/${data.id}/edit`);
    } catch {
      alert("Duplicate failed");
    }
    setBusy(false);
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <h1 className="hero-title" style={{ fontSize: "1.5rem" }}>
          Post Manager
        </h1>
        <p style={{ color: "var(--ads-text-muted)", fontSize: "0.9rem" }}>
          {posts.length} post{posts.length === 1 ? "" : "s"} shown
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Link href="/admin/posts/new" className="header-btn header-btn-primary">
          New Article
        </Link>
        <Link href="/admin/import/blogspot" className="header-btn header-btn-ghost">
          Import Blogspot
        </Link>
        <Link href="/admin/import/linkedin" className="header-btn header-btn-ghost">
          Sync LinkedIn
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "all" ? "/admin/posts" : `/admin/posts?tab=${t.id}`}
            className="header-btn"
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: currentTab === t.id ? "rgba(6,182,212,0.2)" : "transparent",
              color: currentTab === t.id ? "#06b6d4" : "inherit",
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form action="/admin/posts" method="get" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
        {currentTab !== "all" ? <input type="hidden" name="tab" value={currentTab} /> : null}
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", flex: "1 1 220px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Search</span>
          <input
            name="q"
            defaultValue={searchQ}
            placeholder="Title or slug"
            className="header-btn"
            style={{ flex: 1, borderRadius: "0.5rem", padding: "0.4rem 0.65rem", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </label>
        <button type="submit" className="header-btn header-btn-ghost">
          Search
        </button>
        {searchQ && (
          <Link href={currentTab === "all" ? "/admin/posts" : `/admin/posts?tab=${currentTab}`} className="header-btn header-btn-ghost">
            Clear
          </Link>
        )}
      </form>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Bulk:</span>
        <button type="button" disabled={busy || !selected.size} className="header-btn header-btn-ghost" onClick={() => runBulk("publish")}>
          Publish
        </button>
        <button type="button" disabled={busy || !selected.size} className="header-btn header-btn-ghost" onClick={() => runBulk("draft")}>
          Draft
        </button>
        <button type="button" disabled={busy || !selected.size} className="header-btn header-btn-ghost" onClick={() => runBulk("archive")}>
          Archive
        </button>
        <button type="button" disabled={busy || !selected.size} className="header-btn header-btn-ghost" onClick={() => runBulk("delete")} style={{ color: "#f87171" }}>
          Delete
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0.5rem", width: "36px" }}>
                <input type="checkbox" aria-label="Select all" checked={posts.length > 0 && selected.size === posts.length} onChange={toggleAll} />
              </th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Title</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Category</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Status</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Author</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Published</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Views</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!posts || posts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "1.5rem", color: "var(--ads-text-muted)" }}>
                  No posts match. <Link href="/admin/posts/new">Create one</Link>
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={String(post.id)} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={selected.has(String(post.id))}
                      onChange={() => toggle(String(post.id))}
                      aria-label={`Select ${post.title}`}
                    />
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <Link href={`/archives/${post.slug}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                      {post.title || post.slug}
                    </Link>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{post.category || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span className={post.status === "published" ? "chip chip-muted" : "chip"}>{post.status}</span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--ads-text-muted)" }}>{post.author || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--ads-text-muted)" }}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : post.publish_date
                        ? new Date(post.publish_date).toLocaleDateString()
                        : "—"}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--ads-text-muted)" }}>—</td>
                  <td style={{ padding: "0.5rem 0.75rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    <Link href={`/admin/posts/${post.id}/edit`} className="header-btn header-btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                      Edit
                    </Link>
                    <Link href={`/archives/${post.slug}`} target="_blank" rel="noreferrer" className="header-btn header-btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                      Preview
                    </Link>
                    <button
                      type="button"
                      className="header-btn header-btn-ghost"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={() => handleDuplicate(post.id)}
                      disabled={busy}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title || post.slug)}
                      className="header-btn header-btn-ghost"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", color: "#f87171", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
