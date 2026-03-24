import Link from "next/link";

export default function PublisherLandingPage() {
  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-bright)", margin: "0 0 12px" }}>
          Monetize Your Inventory
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          Real-time OpenRTB auction. No ads.txt required to start.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 28 }}>
        <Link
          href="/publisher/register"
          className="portal-card"
          style={{ borderColor: "#00d4aa44", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18 }}>Register Your Site →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Get a publisher ID in seconds. We activate you before traffic monetizes.
          </p>
        </Link>
        <Link
          href="/publisher/dashboard"
          className="portal-card"
          style={{ borderColor: "#4a9eff44", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "#4a9eff", margin: "0 0 10px", fontSize: 18 }}>View My Dashboard →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Paste your publisher ID in the URL to manage ad units and copy MDE tags.
          </p>
        </Link>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
        <span>
          <strong style={{ color: "var(--accent)" }}>&lt; 100ms</strong> auction
        </span>
        <span>
          <strong style={{ color: "var(--accent)" }}>OpenRTB 2.6</strong>
        </span>
        <span>
          <strong style={{ color: "var(--accent)" }}>Real CPM</strong>
        </span>
      </div>
    </div>
  );
}
