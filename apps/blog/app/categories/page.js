import Link from "next/link";
import { getCategoriesWithCounts } from "../../lib/category-metadata";

export const metadata = {
  title: "Categories",
  description: "Browse AdsGupta BlogAI articles by category.",
};

export default async function CategoriesPage() {
  const CATEGORIES = await getCategoriesWithCounts();

  return (
    <div className="shell hero-accent">
      <section className="hero">
        <p className="hero-kicker">Categories</p>
        <h1 className="hero-title">CATEGORIES</h1>
        <p className="hero-description">
          Browse the archives by category.
        </p>
      </section>

      <section className="section-block">
        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const count = cat.count ?? 0;
            return (
              <article key={cat.id} className="category-card">
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-description">{cat.description}</p>
                <p className="category-count">
                  {count} {count === 1 ? "article" : "articles"}
                </p>
                <Link
                  href={`/archives?category=${encodeURIComponent(cat.name)}`}
                  className="chip chip-muted"
                  style={{ marginTop: "0.5rem", display: "inline-block" }}
                >
                  View →
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/archives">← Back to Archives</Link>
      </p>
    </div>
  );
}
