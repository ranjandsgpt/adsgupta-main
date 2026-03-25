import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { DemandLandingStats } from "@/components/demand-landing-stats";
import { DemandResumeDraft } from "@/components/demand-resume-draft";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertiser Self-Serve",
  description: "Start advertising on premium publisher inventory with real OpenRTB 2.6 auctions."
};

const heroFont = { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 800 as const };

export default function DemandLandingPage() {
  const steps = [
    { title: "Create Campaign", desc: "Set budget, bid, targeting, and inventory sizes." },
    { title: "Upload Creative", desc: "Drop JPG/PNG/GIF/WebP — we host on secure blob storage." },
    { title: "Exchange Reviews", desc: "Our team validates policy fit and traffic quality." },
    { title: "Go Live", desc: "Win real OpenRTB auctions on publisher inventory." }
  ];
  return (
    <div style={{ minHeight: "calc(100vh - 80px)", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <CookieConsentBanner />
      <div style={{ marginBottom: 32, flex: "0 0 auto" }}>
        <h1
          style={{
            ...heroFont,
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            color: "var(--text-bright)",
            margin: "0 0 14px",
            letterSpacing: "-0.02em",
            lineHeight: 1.12
          }}
        >
          Start Advertising
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.65, margin: 0, maxWidth: 640 }}>
          Real OpenRTB auctions. Set your bid. Upload your creative. Go live.
        </p>
      </div>

      <DemandLandingStats />

      <DemandResumeDraft />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 36 }}>
        {[{ label: "Second-Price Auctions" }, { label: "Real Publisher Inventory" }, { label: "Self-Serve" }].map((s) => (
          <div
            key={s.label}
            className="portal-card"
            style={{ padding: 18, borderColor: "#0066cc33", background: "linear-gradient(145deg, rgba(0,212,170,0.06), transparent)" }}
          >
            <div style={{ ...heroFont, fontSize: 14, color: "#0066cc", lineHeight: 1.35 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
        <Link
          href="/demand/create"
          className="portal-card"
          style={{ borderColor: "#a855f744", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "#a855f7", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Create Campaign →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Step one: company details, bid CPM, daily budget, sizes, environments, and targeting.
          </p>
        </Link>
        <Link
          href="/demand/dashboard"
          className="portal-card"
          style={{ borderColor: "#0066cc44", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18, ...heroFont }}>Manage Campaigns →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Use the email you registered with: <code style={{ color: "var(--accent)" }}>?email=</code> on the dashboard URL.
          </p>
        </Link>
      </div>

      <div style={{ marginTop: "auto", paddingBottom: 24 }}>
        <h2 style={{ ...heroFont, fontSize: 13, color: "var(--text-bright)", margin: "0 0 18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          How it works
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {steps.map((st, i) => (
            <div
              key={st.title}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "rgba(12,16,24,0.5)"
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#0066cc22",
                  color: "#0066cc",
                  fontWeight: 800,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ ...heroFont, fontSize: 14, color: "var(--text-bright)", marginBottom: 4 }}>{st.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{st.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
