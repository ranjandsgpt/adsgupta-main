import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "../../lib/auth.js";
import { isPostgresConfigured } from "../../lib/cms-runtime.js";
import * as cms from "../../lib/cms-pg.js";

const accent = "#06b6d4";
const muted = "rgba(255,255,255,0.65)";
const card = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.1)";

export default async function AdminDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/admin/login");

  let stats = {
    total_posts: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    archived: 0,
    views: 0,
    subscribers: 0,
    revenue_cents: 0,
    ad_slots_active: 0,
  };
  let recent = [];

  if (isPostgresConfigured()) {
    try {
      stats = await cms.getDashboardStats(user.email);
      const rows = await cms.listRecentPosts(user.email, 8);
      recent = rows.map((r) => cms.mapPostRow(r, user.email));
    } catch {
      /* empty */
    }
  }

  return (
    <section style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="hero-title" style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>
          Dashboard
        </h1>
        <p style={{ color: muted, fontSize: "0.95rem" }}>
          Welcome back, {user.name || user.email.split("@")[0]} · {user.email}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        {[
          ["Total posts", stats.total_posts],
          ["Published", stats.published],
          ["Drafts", stats.drafts],
          ["Scheduled", stats.scheduled],
          ["Archived", stats.archived],
          ["Views", stats.views],
          ["Subscribers", stats.subscribers],
          ["Ad slots active", stats.ad_slots_active ?? 0],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: card,
              border: `1px solid ${border}`,
              borderRadius: "0.75rem",
              padding: "1rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: muted, marginBottom: "0.35rem" }}>{label}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, color: accent }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link href="/admin/posts/new" className="header-btn header-btn-primary">
          New Post
        </Link>
        <Link href="/archives" className="header-btn header-btn-ghost" target="_blank" rel="noreferrer">
          View Site
        </Link>
      </div>

      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "#f8fafc" }}>Recent posts</h2>
      <div style={{ overflowX: "auto", border: `1px solid ${border}`, borderRadius: "0.75rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${border}`, textAlign: "left", background: card }}>
              <th style={{ padding: "0.65rem 0.85rem" }}>Title</th>
              <th style={{ padding: "0.65rem 0.85rem" }}>Status</th>
              <th style={{ padding: "0.65rem 0.85rem" }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "1.25rem", color: muted }}>
                  No posts yet.{" "}
                  <Link href="/admin/posts/new" style={{ color: accent }}>
                    Write your first article
                  </Link>
                </td>
              </tr>
            ) : (
              recent.map((post) => (
                <tr key={String(post.id)} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "0.65rem 0.85rem" }}>
                    <Link href={`/admin/posts/${post.id}/edit`} style={{ color: "inherit" }}>
                      {post.title || post.slug}
                    </Link>
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem" }}>
                    <span className={post.status === "published" ? "chip chip-muted" : "chip"}>{post.status}</span>
                  </td>
                  <td style={{ padding: "0.65rem 0.85rem", color: muted }}>
                    {post.updated_at
                      ? new Date(post.updated_at).toLocaleString()
                      : post.publish_date || "—"}
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
