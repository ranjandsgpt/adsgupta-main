"use client";

import { LiveAuctionTicker } from "@/components/live-auction-ticker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

type NavLink = { href: string; label: string };

type NavSection = { label: string; items: NavLink[] };

function navActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarSection({ pathname, section }: { pathname: string; section: NavSection }) {
  return (
    <div>
      <div className="shell-nav-section">{section.label}</div>
      <nav style={{ display: "grid", gap: 2 }}>
        {section.items.map((it) => {
          const active = navActive(pathname, it.href);
          return (
            <Link key={it.href + it.label} href={it.href} className={`shell-nav-item${active ? " shell-nav-item-active" : ""}`}>
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function homeSidebar(): NavSection[] {
  return [
    {
      label: "Overview",
      items: [
        { href: "/", label: "Platform Home" },
        { href: "/status", label: "Analytics Hub" },
        { href: "/status", label: "Notifications" }
      ]
    },
    {
      label: "Quick Access",
      items: [
        { href: "/platform/activity-log", label: "Recent Activity" },
        { href: "/platform/settings", label: "Settings" },
        { href: "/docs", label: "Documentation" }
      ]
    }
  ];
}

function publisherSidebar(): NavSection[] {
  return [
    {
      label: "Dashboard",
      items: [{ href: "/publisher/dashboard", label: "Revenue Overview" }]
    },
    {
      label: "Inventory",
      items: [
        { href: "/publisher/inventory", label: "Ad Unit Manager" },
        { href: "/publisher/tags", label: "Sites & Apps" },
        { href: "/publisher/tester", label: "CTV Manager" }
      ]
    },
    {
      label: "Yield",
      items: [
        { href: "/publisher/estimate", label: "Floor Pricing" },
        { href: "/publisher/optimizer", label: "Demand Partners" },
        { href: "/docs/mde-js-reference", label: "Header Bidding" }
      ]
    },
    {
      label: "Delivery",
      items: [
        { href: "/publisher/dashboard", label: "Orders" },
        { href: "/publisher/inventory", label: "Creatives" },
        { href: "/publisher/tags", label: "Tag Generator" }
      ]
    },
    {
      label: "Reports",
      items: [
        { href: "/publisher/reporting", label: "Reports" },
        { href: "/privacy", label: "Privacy" }
      ]
    }
  ];
}

function demandSidebar(): NavSection[] {
  return [
    { label: "Dashboard", items: [{ href: "/demand/dashboard", label: "Command Center" }] },
    {
      label: "Campaigns",
      items: [
        { href: "/demand/campaigns", label: "All Campaigns" },
        { href: "/demand/create", label: "Insertion Orders" },
        { href: "/demand/create", label: "AI Builder" }
      ]
    },
    {
      label: "Targeting",
      items: [
        { href: "/demand/campaigns", label: "Audiences" },
        { href: "/demand/create", label: "Geo Targeting" },
        { href: "/docs/api-reference", label: "Data Marketplace" }
      ]
    },
    {
      label: "Creatives",
      items: [
        { href: "/demand/creatives", label: "Creative Studio" },
        { href: "/demand/create", label: "DCO Builder" }
      ]
    },
    {
      label: "Measure",
      items: [
        { href: "/demand/reporting", label: "Attribution" },
        { href: "/demand/reporting", label: "Reports" }
      ]
    }
  ];
}

function exchangeSidebar(): NavSection[] {
  return [
    {
      label: "Exchange",
      items: [
        { href: "/platform", label: "Auction Monitor" },
        { href: "/platform/pricing", label: "Deal Manager" },
        { href: "/platform/publishers", label: "Publishers" },
        { href: "/platform/demand", label: "Demand Partners" }
      ]
    },
    {
      label: "Quality",
      items: [
        { href: "/platform/protections", label: "Brand Safety" },
        { href: "/platform/health", label: "IVT Detection" },
        { href: "/platform/tags", label: "Supply Chain" }
      ]
    },
    {
      label: "Config",
      items: [
        { href: "/platform/settings", label: "Auction Config" },
        { href: "/platform/pricing", label: "Floor Rules" },
        { href: "/platform/tags", label: "Tag Generator" },
        { href: "/platform/quickstart", label: "Quick Start" },
        { href: "/platform/test", label: "Integration Test" }
      ]
    },
    {
      label: "Reports",
      items: [
        { href: "/platform/analytics", label: "Analytics" },
        { href: "/platform/earnings", label: "Earnings" },
        { href: "/platform/auction-log", label: "Auction Log" }
      ]
    }
  ];
}

function docsSidebar(): NavSection[] {
  return [
    {
      label: "Getting Started",
      items: [
        { href: "/docs", label: "Overview" },
        { href: "/docs/publisher-quickstart", label: "Publisher Guide" },
        { href: "/docs/advertiser-quickstart", label: "Advertiser Guide" }
      ]
    },
    {
      label: "Reference",
      items: [
        { href: "/docs/mde-js-reference", label: "mde.js Reference" },
        { href: "/docs/openrtb-endpoint", label: "OpenRTB Endpoint" },
        { href: "/docs/api-reference", label: "API Reference" }
      ]
    }
  ];
}

function detectSidebarMode(pathname: string): "home" | "publisher" | "demand" | "exchange" | "docs" | "prebid" | "none" {
  if (pathname.startsWith("/docs")) return "docs";
  if (pathname.startsWith("/prebid")) return "prebid";
  if (pathname.startsWith("/publisher")) return "publisher";
  if (pathname.startsWith("/demand")) return "demand";
  if (pathname.startsWith("/platform")) return "exchange";
  if (pathname === "/") return "home";
  return "none";
}

function LogoWordmark() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: "var(--accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700
        }}
      >
        AD
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
        Ads<span style={{ color: "var(--accent)", fontWeight: 600 }}>Gupta</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { data: session } = useSession();

  const mode = detectSidebarMode(pathname);
  const isLogin = pathname === "/login";

  const pillClass = (active: boolean) => `portal-pill${active ? " portal-pill-active" : ""}`;

  const platformActive = pathname === "/" || pathname.startsWith("/docs");
  const publisherActive = pathname.startsWith("/publisher");
  const demandActive = pathname.startsWith("/demand");
  const exchangeActive = pathname.startsWith("/platform");
  const prebidActive = pathname.startsWith("/prebid");
  const adminConsoleActive = pathname.startsWith("/platform/settings");

  const sidebarSections =
    mode === "home"
      ? homeSidebar()
      : mode === "publisher"
        ? publisherSidebar()
        : mode === "demand"
          ? demandSidebar()
          : mode === "exchange"
            ? exchangeSidebar()
            : mode === "docs"
              ? docsSidebar()
              : mode === "prebid"
                ? [
                    {
                      label: "Prebid",
                      items: [
                        { href: "/prebid", label: "Overview" },
                        { href: "/docs/mde-js-reference", label: "Header bidding docs" }
                      ]
                    }
                  ]
                : [];

  const showSidebar = !isLogin && mode !== "none" && mode !== "docs";
  const adminBanner =
    session?.user?.role === "admin" && (pathname.startsWith("/publisher") || pathname.startsWith("/demand"));

  if (isLogin) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg3)", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 48,
            flexShrink: 0,
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            zIndex: 100
          }}
        >
          <LogoWordmark />
        </header>
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font)" }}>
      <header
        style={{
          height: 48,
          flexShrink: 0,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px 0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <LogoWordmark />
          <nav style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/" className={pillClass(platformActive)}>
              Platform
            </Link>
            <Link href="/publisher" className={pillClass(publisherActive)}>
              Publisher
            </Link>
            <Link href="/demand" className={pillClass(demandActive)}>
              Demand
            </Link>
            <Link href="/platform" className={pillClass(exchangeActive && !adminConsoleActive)}>
              Exchange
            </Link>
            <Link href="/prebid" className={pillClass(prebidActive)}>
              Prebid
            </Link>
            <Link href="/platform/settings" className={pillClass(adminConsoleActive)}>
              Admin
            </Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="btn-secondary" style={{ padding: "5px 10px", fontSize: 12 }}>
            ⌘K Search
          </button>
          <button type="button" className="btn-ghost" aria-label="Notifications" style={{ padding: 8 }}>
            🔔
          </button>
          <div
            title={session?.user?.email ?? "User"}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {session?.user?.email?.slice(0, 2).toUpperCase() || "RD"}
          </div>
        </div>
      </header>

      {pathname.startsWith("/platform") && (
        <div
          style={{
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
            padding: "6px 20px",
            minHeight: 36
          }}
        >
          <LiveAuctionTicker />
        </div>
      )}

      {adminBanner ? (
        <div
          style={{
            background: "var(--accent-light)",
            borderBottom: "1px solid rgba(26,86,219,0.2)",
            padding: "8px 20px",
            fontSize: 12,
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center"
          }}
        >
          Viewing as Admin —{" "}
          <Link href="/platform" style={{ fontWeight: 600, textDecoration: "underline" }}>
            Go to Admin Dashboard →
          </Link>
        </div>
      ) : null}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {showSidebar ? (
          <aside
            style={{
              width: 180,
              flexShrink: 0,
              background: "var(--bg)",
              borderRight: "1px solid var(--border)",
              overflowY: "auto",
              padding: "12px 0 24px"
            }}
          >
            {sidebarSections.map((s) => (
              <SidebarSection key={s.label} pathname={pathname} section={s} />
            ))}
          </aside>
        ) : null}
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg3)", minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
