import Link from "next/link";
import PostCard from "../components/PostCard";
import Newsletter from "../components/ui/Newsletter";
import { getAllPosts } from "../lib/posts";

function trendingScore(post) {
  const date = post.meta?.date ? new Date(post.meta.date).getTime() : 0;
  const daysAgo = (Date.now() - date) / (1000 * 60 * 60 * 24);
  const minutes = post.readingTime?.minutes || 5;
  return -daysAgo + Math.log(1 + minutes) * 10;
}

export default async function Home() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts || [];
  const latest = (posts || []).slice(0, 6);
  const trending = [...(posts || [])].sort((a, b) => trendingScore(b) - trendingScore(a)).slice(0, 5);

  return (
    <div className="shell hero-accent">
      <section className="hero">
        <p className="hero-kicker">BlogAI by AdsGupta</p>
        <h1 className="hero-title">BlogAI by AdsGupta</h1>
        <p className="hero-description">
          Decoding the future of programmatic advertising, AI monetization and
          digital marketplaces.
        </p>
        <p className="hero-description" style={{ marginTop: "0.6rem", maxWidth: 360 }}>
          Insights from 15+ years in AdTech.
        </p>
        <div style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem" }}>
          <Link href="/archives" className="chip chip-accent">
            Explore The Archives
          </Link>
          <a href="https://demoai.adsgupta.com" target="_blank" rel="noreferrer" className="chip chip-muted">
            Try DemoAI
          </a>
        </div>
      </section>

      {featured && (
        <section className="section-block featured-section">
          <div className="section-header">
            <p className="hero-kicker">Featured Article</p>
            <h2 className="section-title">Featured Article</h2>
          </div>
          <article className="featured-card">
            <PostCard post={featured} />
          </article>
        </section>
      )}

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Latest Stories</p>
          <h2 className="section-title">Latest Stories</h2>
        </div>
        <div className="trending-grid">
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        {latest.length > 0 && (
          <p style={{ marginTop: "1rem" }}>
            <Link href="/archives" className="chip chip-muted">View all in Archives →</Link>
          </p>
        )}
      </section>

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Trending</p>
          <h2 className="section-title">Trending</h2>
        </div>
        <div className="trending-grid">
          {trending.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section-block category-section">
        <div className="section-header">
          <p className="hero-kicker">Categories</p>
          <h2 className="section-title">Categories</h2>
        </div>
        <div className="categories-grid">
          <article className="category-card">
            <Link href="/categories" style={{ textDecoration: "none", color: "inherit" }}>
              <h3 className="category-title">Neural Philosophical</h3>
              <p className="category-description">
                Explorations at the intersection of cognition, neural networks, and attention economies.
              </p>
            </Link>
          </article>
          <article className="category-card">
            <Link href="/categories" style={{ textDecoration: "none", color: "inherit" }}>
              <h3 className="category-title">Marketplace Protocols</h3>
              <p className="category-description">
                How to win in Amazon, Walmart, and marketplace auctions with AI-native playbooks.
              </p>
            </Link>
          </article>
          <article className="category-card">
            <Link href="/categories" style={{ textDecoration: "none", color: "inherit" }}>
              <h3 className="category-title">AdTech Infrastructure</h3>
              <p className="category-description">
                Architecture notes for bidders, data pipelines, and experimentation frameworks.
              </p>
            </Link>
          </article>
          <article className="category-card">
            <Link href="/categories" style={{ textDecoration: "none", color: "inherit" }}>
              <h3 className="category-title">Programmatic Strategy</h3>
              <p className="category-description">
                Header bidding, auction dynamics, and programmatic buying.
              </p>
            </Link>
          </article>
        </div>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/categories" className="chip chip-muted">Browse all categories →</Link>
        </p>
      </section>

      <section className="section-block">
        <Newsletter />
      </section>
    </div>
  );
}
