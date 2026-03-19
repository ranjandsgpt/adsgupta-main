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
      <Header title="pousali.adsgupta.com" />
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 44, letterSpacing: "-0.03em" }}>
          Coming Soon — pousali.adsgupta.com
        </h1>
      </main>
      <Footer />
    </div>
  );
}
