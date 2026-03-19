import * as React from "react";
import { brand } from "@adsgupta/config";

export function Header({ title }: { title: string }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 20px",
        borderBottom: `1px solid ${brand.colors.border}`
      }}
    >
      <div style={{ fontWeight: 650, letterSpacing: "-0.02em" }}>{title}</div>
      <Nav />
    </header>
  );
}

export function Nav() {
  const linkStyle: React.CSSProperties = {
    color: brand.colors.muted,
    textDecoration: "none",
    fontSize: 14
  };

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <a href="/" style={linkStyle}>
        Home
      </a>
    </nav>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        padding: "18px 20px",
        borderTop: `1px solid ${brand.colors.border}`,
        color: brand.colors.muted,
        fontSize: 13
      }}
    >
      © {new Date().getFullYear()} adsgupta.com
    </footer>
  );
}

