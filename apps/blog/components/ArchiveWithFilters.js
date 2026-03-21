"use client";

import { useState, useMemo } from "react";
import PostCard from "./PostCard";

const CATEGORIES = [
  "Neural Philosophical",
  "Marketplace Protocols",
  "AdTech Infrastructure",
  "Revenue Engineering",
  "Programmatic Strategy",
  "Media Buying Systems",
];

function trendingScore(post) {
  const date = post.meta?.date ? new Date(post.meta.date).getTime() : 0;
  const daysAgo = (Date.now() - date) / (1000 * 60 * 60 * 24);
  const minutes = post.readingTime?.minutes || 5;
  return -daysAgo + Math.log(1 + minutes) * 10;
}

export default function ArchiveWithFilters({ posts, latestCount = 5, trendingCount = 5, searchOnly = false }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    let list = posts || [];
    if (category) {
      list = list.filter((p) => (p.meta?.category || p.category) === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.meta?.title || p.title || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.meta?.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, category, search]);

  const latest = useMemo(() => (posts || []).slice(0, latestCount), [posts, latestCount]);
  const trending = useMemo(
    () =>
      [...(posts || [])]
        .sort((a, b) => trendingScore(b) - trendingScore(a))
        .slice(0, trendingCount),
    [posts, trendingCount]
  );

  return (
    <>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <input
          type="search"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="header-btn"
          style={{
            flex: "1",
            minWidth: "200px",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.75rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label="Search articles"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="header-btn"
          style={{
            borderRadius: "0.5rem",
            padding: "0.5rem 0.75rem",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: "180px",
          }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {!searchOnly && (
        <>
          <section className="section-block">
            <div className="section-header">
              <p className="hero-kicker">Latest</p>
              <h2 className="section-title">Latest Articles</h2>
            </div>
            <div className="trending-grid" style={{ marginBottom: "2rem" }}>
              {latest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-header">
              <p className="hero-kicker">Trending</p>
              <h2 className="section-title">Trending in the Archives</h2>
            </div>
            <div className="trending-grid" style={{ marginBottom: "2rem" }}>
              {trending.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Archive Index</p>
          <h2 className="section-title">
            All Articles {filtered.length !== (posts || []).length ? `(${filtered.length})` : ""}
          </h2>
        </div>
        <section className="masonry">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
        {filtered.length === 0 && (
          <p style={{ color: "var(--ads-text-muted)", marginTop: "1rem" }}>
            No articles match your search or filter.
          </p>
        )}
      </section>
    </>
  );
}
