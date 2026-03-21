import Link from "next/link";

export const metadata = {
  title: "Series",
  description: "Article series and collections from AdsGupta BlogAI.",
};

export default function SeriesPage() {
  const series = [
    {
      id: "if-i-was-born-as-an-ad",
      title: "If I Was Born As An Ad",
      description: "Narrative essays from the perspective of an ad navigating auctions and attention.",
      count: "Coming soon",
    },
    {
      id: "100-stories-programmatic",
      title: "100 Stories on Programmatic Advertising",
      description: "Micro-stories on the strange, brilliant, and broken edges of programmatic ecosystems.",
      count: "Series",
    },
    {
      id: "adtech-interviews",
      title: "AdTech Interviews",
      description: "Conversations with builders, traders, and architects shaping the next wave of ad-tech.",
      count: "Coming soon",
    },
  ];

  return (
    <div className="shell hero-accent">
      <section className="hero">
        <p className="hero-kicker">Series</p>
        <h1 className="hero-title">SERIES</h1>
        <p className="hero-description">
          Curated article series and collections from the AdsGupta archives.
        </p>
      </section>

      <section className="section-block">
        <div className="categories-grid">
          {series.map((s) => (
            <article key={s.id} className="category-card">
              <h3 className="category-title">{s.title}</h3>
              <p className="category-description">{s.description}</p>
              <p className="category-count">{s.count}</p>
              <Link href="/archives" className="chip chip-muted" style={{ marginTop: "0.5rem", display: "inline-block" }}>
                View Archives
              </Link>
            </article>
          ))}
        </div>
      </section>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/archives">← Back to Archives</Link>
      </p>
    </div>
  );
}
