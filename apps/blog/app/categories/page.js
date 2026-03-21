import Link from "next/link";
import { getAllPosts } from "../../lib/posts";

export const metadata = {
  title: "Categories",
  description: "Browse AdsGupta BlogAI articles by category.",
};

const CATEGORIES = [
  { name: "Neural Philosophical", description: "Long-form essays on cognition, attention, and how neural systems reshape advertising." },
  { name: "Marketplace Protocols", description: "Playbooks for Amazon, Walmart, and marketplace auctions." },
  { name: "AdTech Infrastructure", description: "Standards, regulation, and platform shifts." },
  { name: "Revenue Engineering", description: "Monetization strategy and revenue systems." },
  { name: "Programmatic Strategy", description: "Header bidding, auction dynamics, programmatic buying." },
  { name: "Media Buying Systems", description: "Media buying optimization and infrastructure." },
];

export default async function CategoriesPage() {
  const posts = await getAllPosts();
  const counts = (posts || []).reduce((acc, post) => {
    const cat = post.meta?.category;
    if (!cat) return acc;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

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
            const count = counts[cat.name] ?? 0;
            return (
              <article key={cat.name} className="category-card">
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
