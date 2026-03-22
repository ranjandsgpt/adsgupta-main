import PostCard from "../../components/PostCard";
import ArchiveWithFilters from "../../components/ArchiveWithFilters";
import { getAllPosts } from "../../lib/posts";
import { getCategoriesWithCounts } from "../../lib/category-metadata";
import Newsletter from "../../components/ui/Newsletter";
import SponsoredInsightCard from "../../components/ui/SponsoredInsightCard";

export const metadata = {
  title: "The Archives",
  description:
    "Strategic essays on programmatic infrastructure, auction dynamics, monetization strategy, and the future of digital advertising.",
  openGraph: {
    title: "The Archives — AdsGupta",
    description:
      "Strategic essays on programmatic infrastructure, auction dynamics, monetization strategy, and the future of digital advertising.",
    type: "website",
  },
};

function trendingScore(post) {
  const date = post.meta?.date ? new Date(post.meta.date).getTime() : 0;
  const daysAgo = (Date.now() - date) / (1000 * 60 * 60 * 24);
  const minutes = post.readingTime?.minutes || 5;
  return -daysAgo + Math.log(1 + minutes) * 10;
}

export default async function ArchivesPage() {
  const [posts, categoryList] = await Promise.all([getAllPosts(), getCategoriesWithCounts()]);

  if (!posts || posts.length === 0) {
    return (
      <div className="shell hero-accent">
        <section className="hero">
          <p className="hero-kicker">The Archives</p>
          <h1 className="hero-title">THE ARCHIVES</h1>
          <p className="hero-description">
            Strategic essays on programmatic infrastructure, auction dynamics,
            monetization strategy, and the future of digital advertising.
          </p>
        </section>
        <p style={{ marginTop: "2rem", color: "var(--ads-text-muted, #9ca3af)" }}>
          No articles have been published yet. Check back soon.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const latest = posts.slice(0, 8);
  const trending = [...posts].sort((a, b) => trendingScore(b) - trendingScore(a)).slice(0, 5);

  const categoryCounts = posts.reduce((acc, post) => {
    const cat = post.meta?.category;
    if (!cat) return acc;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="shell hero-accent">
      <section className="hero">
        <p className="hero-kicker">The Archives</p>
        <h1 className="hero-title">THE ARCHIVES</h1>
        <p className="hero-description">
          Strategic essays on programmatic infrastructure, auction dynamics,
          monetization strategy, and the future of digital advertising.
        </p>
      </section>

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Latest Stories</p>
          <h2 className="section-title">Latest Stories</h2>
        </div>
        <div className="trending-grid" style={{ marginBottom: "2rem" }}>
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {featured && (
        <section className="section-block featured-section">
          <p className="hero-kicker">Featured</p>
          <h2 className="section-title">Featured Article</h2>
          <article className="featured-card">
            <PostCard post={featured} />
          </article>
        </section>
      )}

      <section className="section-block category-section">
        <div className="section-header">
          <p className="hero-kicker">Categories</p>
          <h2 className="section-title">Explore by Category</h2>
        </div>
        <div className="categories-grid">
          {categoryList.map((cat) => {
            const count = categoryCounts[cat.name] ?? cat.count ?? 0;
            return (
              <article key={cat.id} className="category-card">
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-description">{cat.description}</p>
                <p className="category-count">
                  {count} {count === 1 ? "article" : "articles"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Trending</p>
          <h2 className="section-title">Trending</h2>
        </div>
        <div className="trending-grid" style={{ marginBottom: "2rem" }}>
          {trending.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Search</p>
          <h2 className="section-title">Search the Archives</h2>
        </div>
        <ArchiveWithFilters posts={posts} searchOnly />
      </section>

      <Newsletter />

      <section className="section-block">
        <div className="section-header">
          <p className="hero-kicker">Partner Slot</p>
          <h2 className="section-title">Sponsored Insight</h2>
        </div>
        <SponsoredInsightCard />
      </section>
    </div>
  );
}
