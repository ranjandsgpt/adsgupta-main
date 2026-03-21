"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/archives?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/archives");
    }
  }

  return (
    <div className="shell hero-accent">
      <section className="hero">
        <p className="hero-kicker">Search</p>
        <h1 className="hero-title">SEARCH</h1>
        <p className="hero-description">
          Search the AdsGupta archives by keyword.
        </p>
      </section>

      <form onSubmit={handleSubmit} style={{ maxWidth: "560px", marginTop: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="header-btn"
            style={{
              flex: 1,
              minWidth: "200px",
              borderRadius: "0.5rem",
              padding: "0.6rem 1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              textTransform: "none",
            }}
            aria-label="Search"
          />
          <button type="submit" className="header-btn header-btn-primary">
            Search
          </button>
        </div>
      </form>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/archives">Browse all archives →</Link>
      </p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="shell" style={{ padding: "4rem", color: "var(--ads-text-muted)" }}>Loading…</div>}>
      <SearchForm />
    </Suspense>
  );
}
