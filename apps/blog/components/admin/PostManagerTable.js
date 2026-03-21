"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostManagerTable({ posts }) {
  const router = useRouter();

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  if (!posts || posts.length === 0) {
    return (
      <tr>
        <td colSpan={6} style={{ padding: "1.5rem", color: "var(--ads-text-muted)" }}>
          No posts match the filters. <Link href="/admin/posts/new" className="chip chip-accent">Create one</Link>
        </td>
      </tr>
    );
  }

  return posts.map((post) => (
    <tr key={post.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <td style={{ padding: "0.5rem 0.75rem" }}>
        <Link href={`/archives/${post.slug}`} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
          {post.title || post.slug}
        </Link>
      </td>
      <td style={{ padding: "0.5rem 0.75rem" }}>{post.source || "—"}</td>
      <td style={{ padding: "0.5rem 0.75rem" }}>{post.category || "—"}</td>
      <td style={{ padding: "0.5rem 0.75rem", color: "var(--ads-text-muted)" }}>
        {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : "—"}
      </td>
      <td style={{ padding: "0.5rem 0.75rem" }}>
        <span className={post.status === "published" ? "chip chip-muted" : "chip"}>{post.status}</span>
      </td>
      <td style={{ padding: "0.5rem 0.75rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
        <Link href={`/admin/posts/${post.id}/edit`} className="header-btn header-btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
          Edit
        </Link>
        <Link href={`/archives/${post.slug}`} target="_blank" rel="noreferrer" className="header-btn header-btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
          Preview
        </Link>
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
  ));
}
