import { brand } from "@adsgupta/config";
import { Footer } from "@adsgupta/ui";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.colors.background,
        color: brand.colors.foreground,
        fontFamily: brand.fonts.sans,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: `1px solid ${brand.colors.border}`,
          background: brand.colors.background
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>adsgupta.com</div>
      </div>
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: 24
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 720 }}>
          <div style={{ color: brand.colors.muted, fontSize: 14 }}>
            Coming Soon — adsgupta.com
          </div>
          <h1 style={{ marginTop: 10, fontSize: 44, letterSpacing: "-0.03em" }}>
            The main site is being rebuilt.
          </h1>
          <p style={{ marginTop: 12, color: brand.colors.muted, fontSize: 16 }}>
            This repo is now a monorepo powering all subdomains.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
