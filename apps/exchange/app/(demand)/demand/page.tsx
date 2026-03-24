import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";

export default function DemandLandingPage() {
  const steps = [
    { title: "Create Campaign", desc: "Set budget, bid, targeting, and inventory sizes." },
    { title: "Upload Creative", desc: "Drop JPG/PNG/GIF/WebP — we host on secure blob storage." },
    { title: "Exchange Reviews", desc: "Our team validates policy fit and traffic quality." },
    { title: "Go Live", desc: "Win real OpenRTB auctions on publisher inventory." }
  ];
  return (
    <div style={{ maxWidth: 960 }}>
      <CookieConsentBanner />
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-bright)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
          Start Advertising
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.65, margin: 0, maxWidth: 640 }}>
          Real OpenRTB auctions. Set your bid. Upload your creative. Go live.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Second-Price Auctions", sub: "Fair clearing on every impression" },
          { label: "Real Publisher Inventory", sub: "Web, app, and CTV supply" },
          { label: "Self-Serve", sub: "Register, upload, and manage in one portal" }
        ].map((s) => (
          <div
            key={s.label}
            className="portal-card"
            style={{ padding: 18, borderColor: "#00d4aa33", background: "linear-gradient(145deg, rgba(0,212,170,0.06), transparent)" }}
          >
            <div style={{ fontWeight: 700, color: "#00d4aa", fontSize: 14, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 40 }}>
        <Link
          href="/demand/create"
          className="portal-card"
          style={{ borderColor: "#a855f744", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "#a855f7", margin: "0 0 10px", fontSize: 19 }}>Create Campaign →</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Step one of the wizard: company details, bid CPM, daily budget, sizes, environments, and targeting.
          </p>
        </Link>
        <Link
          href="/demand/dashboard"
          className="portal-card"
          style={{ borderColor: "#00d4aa44", textDecoration: "none", padding: 24 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 19 }}>Manage Campaigns →</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Open the dashboard with the email you registered: add <code style={{ color: "var(--accent)" }}>?email=</code> in the URL.
          </p>
        </Link>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-bright)", margin: "0 0 18px" }}>How it works</h2>
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
                  background: "#00d4aa22",
                  color: "#00d4aa",
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
                <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: 14, marginBottom: 4 }}>{st.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{st.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
