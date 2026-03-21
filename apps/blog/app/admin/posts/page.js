import Link from "next/link";
import { getAllPostsForAdmin } from "../../../lib/db.js";
import PostManagerTable from "../../../components/admin/PostManagerTable";

const CATEGORIES = ["Neural Philosophical", "Marketplace Protocols", "AdTech Infrastructure", "Revenue Engineering", "Programmatic Strategy", "Media Buying Systems"];
const SOURCES = ["LinkedIn", "Blogspot", "AdsGupta Intelligence", "AdsGupta"];

export default async function AdminPostsPage({ searchParams }) {
  const category = searchParams?.category || "";
  const source = searchParams?.source || "";
  const status = searchParams?.status || "";
  const filters = { category: category || undefined, source: source || undefined, status: status || undefined };
  const posts = getAllPostsForAdmin(filters);
  const total = getAllPostsForAdmin().length;
  const live = getAllPostsForAdmin().filter((p) => p.status === "published").length;
  const drafts = getAllPostsForAdmin().filter((p) => p.status === "draft").length;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <h1 className="hero-title" style={{ fontSize: "1.5rem" }}>Post Manager</h1>
        <p style={{ color: "var(--ads-text-muted)", fontSize: "0.9rem" }}>
          {total} total · {live} live · {drafts} drafts
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link href="/admin/posts/new" className="header-btn header-btn-primary">New Article</Link>
        <Link href="/admin/import/blogspot" className="header-btn header-btn-ghost">Import Blogspot</Link>
        <Link href="/admin/import/linkedin" className="header-btn header-btn-ghost">Sync LinkedIn</Link>
      </div>

      <form method="get" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Category</span>
          <select name="category" defaultValue={category} className="header-btn" style={{ borderRadius: "0.5rem", padding: "0.35rem 0.6rem", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Source</span>
          <select name="source" defaultValue={source} className="header-btn" style={{ borderRadius: "0.5rem", padding: "0.35rem 0.6rem", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}>
            <option value="">All</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--ads-text-muted)" }}>Status</span>
          <select name="status" defaultValue={status} className="header-btn" style={{ borderRadius: "0.5rem", padding: "0.35rem 0.6rem", border: "1px solid rgba(255,255,255,0.1)", minWidth: "100px" }}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="submit" className="header-btn header-btn-ghost" style={{ padding: "0.35rem 0.75rem" }}>Filter</button>
        {(category || source || status) && (
          <Link href="/admin/posts" className="header-btn header-btn-ghost" style={{ padding: "0.35rem 0.75rem" }}>Clear</Link>
        )}
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0.75rem" }}>Title</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Source</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Category</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Date</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Status</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <PostManagerTable posts={posts} />
          </tbody>
        </table>
      </div>
    </section>
  );
}
