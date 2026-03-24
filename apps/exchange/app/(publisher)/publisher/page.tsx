import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";

const heroFont = { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 800 as const };

export default function PublisherLandingPage() {
  return (
    <div style={{ maxWidth: 960 }}>
      <CookieConsentBanner />
      <section style={{ marginBottom: 40 }}>
        <h1
          style={{
            ...heroFont,
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            color: "var(--text-bright)",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15
          }}
        >
          Monetize Your Inventory
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
          Real-time OpenRTB 2.6 auctions. No ads.txt required.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 36
        }}
      >
        {[
          { t: "< 100ms Auction", d: "Low-latency decisioning" },
          { t: "OpenRTB 2.6", d: "Standard bid request / response" },
          { t: "Second-Price Clearing", d: "Efficient clearing for buyers" }
        ].map((c) => (
          <div key={c.t} className="card" style={{ padding: 16 }}>
            <div style={{ ...heroFont, fontSize: 13, color: "var(--accent)", marginBottom: 6 }}>{c.t}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 44 }}>
        <Link
          href="/publisher/estimate"
          className="portal-card"
          style={{ borderColor: "#a855f744", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "#a855f7", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Revenue estimator →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            See modeled monthly earnings before you register — no login required.
          </p>
        </Link>
        <Link
          href="/publisher/register"
          className="portal-card"
          style={{ borderColor: "#00d4aa44", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Register Your Site →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Create a publisher ID and choose your primary ad formats. We will activate you before traffic runs.
          </p>
        </Link>
        <Link
          href="/publisher/login"
          className="portal-card"
          style={{ borderColor: "#4a9eff44", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "#4a9eff", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Publisher Dashboard →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Sign in or open your dashboard with your publisher UUID to manage ad units and MDE tags.
          </p>
        </Link>
      </div>

      <section>
        <h2 style={{ ...heroFont, fontSize: 14, color: "var(--text-bright)", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          How it works
        </h2>
        <div style={{ display: "grid", gap: 14 }}>
          {[
            { step: "1", title: "Register", body: "Submit your site, domain, and contact email." },
            { step: "2", title: "Get Tag", body: "Once activated, create ad units and copy the MDE embed tag." },
            { step: "3", title: "Earn", body: "OpenRTB auctions run on your inventory with second-price clearing." }
          ].map((s) => (
            <div key={s.step} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#00d4aa18",
                  border: "1px solid #00d4aa44",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  flexShrink: 0
                }}
              >
                {s.step}
              </div>
              <div>
                <div style={{ ...heroFont, fontSize: 14, color: "var(--text-bright)", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
