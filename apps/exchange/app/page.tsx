import Link from "next/link";

export default function PortalHubPage() {
  return (
    <div className="portal-hub">
      <div className="card">
        <h1 style={{ margin: "0 0 8px", color: "var(--text-bright)", fontSize: 22 }}>
          MyExchange · Portals
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
          Choose how you work with the exchange: operations console for admins, self-serve for publishers,
          and demand tools for buyers/DSP seats. OpenRTB auction, tracking, and{" "}
          <code style={{ color: "var(--accent)" }}>mde.js</code> run on the same stack at{" "}
          <strong style={{ color: "var(--text-bright)" }}>exchange.adsgupta.com</strong>.
        </p>
      </div>

      <div className="portal-grid">
        <Link className="portal-card" href="/login?portal=admin&callbackUrl=/admin">
          <h2>Exchange admin</h2>
          <p>Full stack: inventory, delivery, demand partner catalog, yield rules, reporting, protections, AI shell, tag generator, and settings.</p>
        </Link>
        <Link className="portal-card" href="/login?portal=publisher&callbackUrl=/publisher">
          <h2>Publisher</h2>
          <p>Your sites and ad units, embeddable tags, and performance scoped to your publisher account.</p>
        </Link>
        <Link className="portal-card" href="/login?portal=demand&callbackUrl=/demand">
          <h2>Demand</h2>
          <p>Campaigns, creatives, and win/imp metrics for your seat (optional advertiser lock via env).</p>
        </Link>
      </div>
    </div>
  );
}
