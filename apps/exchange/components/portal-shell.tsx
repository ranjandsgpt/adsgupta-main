"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export type PortalNavItem = { href: string; label: string };

type Props = {
  children: React.ReactNode;
  subtitle: string;
  nav: readonly PortalNavItem[];
  portalLabel: string;
};

export function PortalShell({ children, subtitle, nav, portalLabel }: Props) {
  const pathname = usePathname();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">{portalLabel}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>{subtitle}</div>
        <nav className="nav">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <Link href="/" className="nav-minor">
            ← All portals
          </Link>
          <button
            type="button"
            className="link-button"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="top">
          <strong>exchange.adsgupta.com</strong>
          <span className="pill-live">● LIVE</span>
        </div>
        <section className="page">{children}</section>
      </main>
    </div>
  );
}
