import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publisher Monetization",
  description: "Monetize your website with real OpenRTB auctions and fair, second-price clearing."
};

const heroFont = { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 800 as const };

export default function PublisherLandingPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <CookieConsentBanner />
      <section style={{ marginBottom: 40, flex: "0 0 auto" }}>
        <h1
          style={{
            ...heroFont,
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            color: "var(--text-bright)",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.12
          }}
        >
          Monetize Your Inventory
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.65, margin: 0, maxWidth: 560 }}>
          Real-time OpenRTB 2.6 auctions. No ads.txt required.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 40
        }}
      >
        {[
          { t: "< 100ms Auction" },
          { t: "OpenRTB 2.6" },
          { t: "Second-Price Clearing" }
        ].map((c) => (
          <div key={c.t} className="card" style={{ padding: 18 }}>
            <div style={{ ...heroFont, fontSize: 14, color: "var(--accent)", lineHeight: 1.35 }}>{c.t}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 48
        }}
      >
        <Link
          href="/publisher/register"
          className="portal-card"
          style={{ borderColor: "#00d4aa44", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Register Your Site →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Submit your domain and formats. We issue a publisher ID and activate you before traffic runs.
          </p>
        </Link>
        <Link
          href="/publisher/login"
          className="portal-card"
          style={{ borderColor: "#4a9eff44", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "#4a9eff", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Publisher Dashboard →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Open your dashboard with your publisher UUID to manage ad units, floors, and MDE tags.
          </p>
        </Link>
        <Link
          href="/publisher/estimate"
          className="portal-card"
          style={{ borderColor: "#00d4aa33", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18, ...heroFont }}>
            Revenue estimator →
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
            No login: model monthly earnings from traffic, geo, and content category.
          </p>
        </Link>
      </div>

      <section style={{ marginTop: "auto", paddingBottom: 24 }}>
        <h2
          style={{
            ...heroFont,
            fontSize: 13,
            color: "var(--text-bright)",
            margin: "0 0 20px",
            textTransform: "uppercase",
            letterSpacing: "0.06em"
          }}
        >
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
