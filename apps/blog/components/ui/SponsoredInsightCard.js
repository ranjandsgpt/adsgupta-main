import Link from "next/link";

export default function SponsoredInsightCard() {
  return (
    <article className="sponsored-card">
      <div className="sponsored-label">Sponsored Insight</div>
      <h3 className="sponsored-title">
        Neural marketplace strategy for your next launch.
      </h3>
      <p className="sponsored-description">
        Reserved for partners who want to plug their data, tools, or inventory
        into the AdsGupta intelligence layer. This slot will feature a single,
        deeply aligned signal — not generic banner noise.
      </p>
      <p className="sponsored-meta">
        Future placement · Limited to protocol-aligned partners
      </p>
      <Link
        href="https://adsgupta.com"
        target="_blank"
        rel="noreferrer"
        className="chip chip-muted"
      >
        Learn about partnerships
      </Link>
    </article>
  );
}

