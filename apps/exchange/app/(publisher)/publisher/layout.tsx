"use client";

import { PortalShell } from "@/components/portal-shell";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PUB_NAV = [
  ["/publisher", "Dashboard"],
  ["/publisher/inventory", "Ad units"],
  ["/publisher/tags", "Tags"],
  ["/publisher/reporting", "Reporting"]
] as const;

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/publisher/register" || pathname === "/publisher/dashboard";

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
            alignItems: "center"
          }}
        >
          <Link href="/" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
            MyExchange
          </Link>
          <Link href="/publisher/register" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Register
          </Link>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    );
  }

  return (
    <PortalShell
      portalLabel="Publisher"
      subtitle="Self-serve supply"
      nav={PUB_NAV.map(([href, label]) => ({ href, label }))}
    >
      {children}
    </PortalShell>
  );
}
