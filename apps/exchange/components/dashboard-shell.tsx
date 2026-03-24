"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Dashboard"],
  ["/inventory", "Inventory"],
  ["/delivery", "Delivery"],
  ["/demand", "Demand Partners"],
  ["/yield", "Yield & Pricing"],
  ["/reporting", "Reporting"],
  ["/ai", "AI Studio"],
  ["/protections", "Protections"],
  ["/tags", "Tag Generator"],
  ["/settings", "Settings"]
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">MyExchange</div>
        <nav className="nav">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="top">
          <strong>exchange.adsgupta.com</strong>
          <span>LIVE</span>
        </div>
        <section className="page">{children}</section>
      </main>
    </div>
  );
}
