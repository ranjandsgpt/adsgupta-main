import { brand } from "@adsgupta/config";
import { Footer, Header } from "@adsgupta/ui";

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
      <Header title="adsgupta.com" />
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
