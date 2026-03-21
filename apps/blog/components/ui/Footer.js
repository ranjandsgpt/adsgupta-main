export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell-wide footer-grid">
        <div className="footer-divider" />
        <div>
          <div className="badge" style={{ marginBottom: "0.85rem" }}>
            <span className="badge-dot" />
            <span>AI-Native Ad-Tech Intelligence Layer</span>
          </div>
          <p style={{ maxWidth: 380, marginBottom: "0.6rem" }}>
            AdsGupta is the intelligence layer for modern ad-tech — neural
            optimization, marketplace dominance, and auction-aware
            infrastructure for brands that live inside the bidstream.
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            © {year} AdsGupta. All rights reserved.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="pill-row" style={{ justifyContent: "flex-end" }}>
            <a
              href="https://adsgupta.com"
              target="_blank"
              rel="noreferrer"
              className="chip chip-muted"
            >
              Main Site
            </a>
            <a
              href="https://blog.adsgupta.com"
              target="_blank"
              rel="noreferrer"
              className="chip chip-muted"
            >
              Intelligence Feed
            </a>
            <a
              href="https://tools.adsgupta.com"
              target="_blank"
              rel="noreferrer"
              className="chip chip-muted"
            >
              Tools
            </a>
            <a
              href="https://demoai.adsgupta.com"
              target="_blank"
              rel="noreferrer"
              className="chip chip-accent"
            >
              DemoAI
            </a>
          </div>
          <p
            style={{
              marginTop: "0.9rem",
              fontSize: "0.7rem",
              color: "#6b7280",
            }}
          >
            Powered by the AdsGupta Neural Engine — reusable across every
            AdsGupta protocol and subdomain.
          </p>
        </div>
      </div>
    </footer>
  );
}

