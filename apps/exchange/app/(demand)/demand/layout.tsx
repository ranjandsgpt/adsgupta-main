"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkStyle = { fontSize: 11, color: "var(--text-muted)", textDecoration: "none", marginRight: 16 };

export default function DemandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic =
    pathname === "/demand" || pathname === "/demand/create" || pathname === "/demand/dashboard";

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
          <Link href="/demand" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800 }}>
            MyExchange · Demand
          </Link>
          <div>
            <Link href="/demand/create" style={linkStyle}>
              Create
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
        <Link href="/demand" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800 }}>
          Demand console
        </Link>
        <Link href="/demand/campaigns" style={{ ...linkStyle, color: pathname.startsWith("/demand/campaigns") ? "var(--accent)" : undefined }}>
          Campaigns
        </Link>
        <Link href="/demand/creatives" style={{ ...linkStyle, color: pathname.startsWith("/demand/creatives") ? "var(--accent)" : undefined }}>
          Creatives
        </Link>
        <Link href="/demand/reporting" style={{ ...linkStyle, color: pathname.startsWith("/demand/reporting") ? "var(--accent)" : undefined }}>
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
