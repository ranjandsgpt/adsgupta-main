"use client";

import { PortalShell } from "@/components/portal-shell";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEMAND_NAV = [
  ["/demand", "Dashboard"],
  ["/demand/campaigns", "Campaigns"],
  ["/demand/creatives", "Creatives"],
  ["/demand/reporting", "Reporting"]
] as const;

export default function DemandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/demand/create" || pathname === "/demand/dashboard";

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
            MyExchange · Demand
          </Link>
          <Link href="/demand/create" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Create campaign
          </Link>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    );
  }

  return (
    <PortalShell
      portalLabel="Demand"
      subtitle="Buy-side / DSP seat"
      nav={DEMAND_NAV.map(([href, label]) => ({ href, label }))}
    >
      {children}
    </PortalShell>
  );
}
