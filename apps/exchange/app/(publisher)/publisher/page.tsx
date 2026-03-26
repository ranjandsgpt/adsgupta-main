import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publisher Monetization",
  description: "Monetize your website with real OpenRTB auctions and fair clearing."
};

export default function PublisherLandingPage() {
  return (
    <div className="page-content" style={{ paddingTop: 48, textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
      <CookieConsentBanner />
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>Monetize Your Website</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: "0 auto 28px", maxWidth: 520 }}>
        Real OpenRTB 2.6 auctions. Self-serve setup. Revenue from day one.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
        <Link href="/publisher/register" className="btn-primary">
          Register Publisher →
        </Link>
        <Link href="/publisher/dashboard" className="btn-secondary">
          View Dashboard →
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, textAlign: "left" }}>
        {[
          { t: "Real Auctions", d: "Live OpenRTB 2.6 auctions.", i: "◆" },
          { t: "No Ads.txt Required", d: "Start earning while you complete ads.txt at your pace.", i: "✓" },
          { t: "Self-Serve Setup", d: "Register, create units, and deploy tags in minutes.", i: "⚙" }
        ].map((c) => (
          <div key={c.t} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{c.i}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{c.t}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
