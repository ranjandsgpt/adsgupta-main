"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkStyle = { fontSize: 11, color: "var(--text-muted)", textDecoration: "none", marginRight: 16 };

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic =
    pathname === "/publisher" ||
    pathname === "/publisher/register" ||
    pathname === "/publisher/login" ||
    pathname === "/publisher/dashboard";

  if (isPublic) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-header)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8
          }}
        >
          <Link href="/publisher" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800 }}>
            MyExchange · Publisher
          </Link>
          <div>
            <Link href="/publisher/register" style={linkStyle}>
              Register
            </Link>
            <Link href="/" style={linkStyle}>
              Hub
            </Link>
          </div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-header)",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <Link href="/publisher" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800 }}>
          Publisher console
        </Link>
        <Link href="/publisher/inventory" style={{ ...linkStyle, color: pathname.startsWith("/publisher/inventory") ? "var(--accent)" : undefined }}>
          Ad units
        </Link>
        <Link href="/publisher/tags" style={{ ...linkStyle, color: pathname.startsWith("/publisher/tags") ? "var(--accent)" : undefined }}>
          Tags
        </Link>
        <Link href="/publisher/reporting" style={{ ...linkStyle, color: pathname.startsWith("/publisher/reporting") ? "var(--accent)" : undefined }}>
          Reporting
        </Link>
        <Link href="/" style={{ ...linkStyle, marginLeft: "auto" }}>
          Hub
        </Link>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
