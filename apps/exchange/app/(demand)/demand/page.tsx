import Link from "next/link";

export default function DemandLandingPage() {
  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-bright)", margin: "0 0 12px" }}>
          Start Advertising
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          Upload your creative, set your bid, go live in minutes.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 28 }}>
        <Link
          href="/demand/create"
          className="portal-card"
          style={{ borderColor: "#a855f744", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "#a855f7", margin: "0 0 10px", fontSize: 18 }}>Create Campaign →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Three-step wizard: budget, creative to Blob, confirmation.
          </p>
        </Link>
        <Link
          href="/demand/dashboard"
          className="portal-card"
          style={{ borderColor: "#00d4aa44", textDecoration: "none", padding: 22 }}
        >
          <h2 style={{ color: "var(--accent)", margin: "0 0 10px", fontSize: 18 }}>Manage Campaigns →</h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Use the email you registered with: <code>?email=you@…</code>
          </p>
        </Link>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
        <span>
          <strong style={{ color: "var(--accent)" }}>Real OpenRTB</strong> Auctions
        </span>
        <span>
          <strong style={{ color: "var(--accent)" }}>Second-Price</strong> Clearing
        </span>
        <span>
          <strong style={{ color: "var(--accent)" }}>Self-Serve</strong>
        </span>
      </div>
    </div>
  );
}
