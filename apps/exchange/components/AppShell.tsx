"use client";

import { LiveAuctionTicker } from "@/components/live-auction-ticker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
        { href: "/publisher/inventory", label: "Ad Units" },
        { href: "/publisher/tags", label: "Sites & Apps" },
        { href: "/publisher/tags", label: "Tag Generator" }
      ]
    },
    {
      label: "Yield",
      items: [
        { href: "/publisher/estimate", label: "Floor Pricing" },
        { href: "/publisher/optimizer", label: "Floor Optimizer" }
      ]
    },
    {
      label: "Header Bidding",
      items: [
        { href: "/prebid", label: "Adapter Setup" },
        { href: "/docs/mde-js-reference", label: "Prebid Config" },
        { href: "/publisher/estimate", label: "Price Floors" }
      ]
    },
    {
      label: "Reports",
      items: [
        { href: "/publisher/reporting", label: "Revenue Reports" },
        { href: "/publisher/reporting", label: "Fill Rate Analysis" }
      ]
    },
    {
      label: "Finance",
      items: [{ href: "/publisher/earnings", label: "Earnings Statements" }]
    },
    {
      label: "Settings",
      items: [{ href: "/publisher/register", label: "Account" }]
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
        { href: "/demand/create", label: "Create Campaign" },
        { href: "/demand/campaigns", label: "Line Items" }
      ]
    },
    {
      label: "Creatives",
      items: [
        { href: "/demand/creatives", label: "Creative Studio" },
        { href: "/demand/creatives", label: "A/B Testing" }
      ]
    },
    {
      label: "Targeting",
      items: [
        { href: "/demand/campaigns", label: "Audiences" },
        { href: "/demand/create", label: "Geo & Devices" },
        { href: "/demand/create", label: "Frequency Caps" }
      ]
    },
    {
      label: "OpenRTB",
      items: [
        { href: "/demand/openrtb-log", label: "Bid Requests Log" },
        { href: "/docs/openrtb-endpoint", label: "DSP Configuration" }
      ]
    },
    {
      label: "Reports",
      items: [
        { href: "/demand/reporting", label: "Campaign Performance" },
        { href: "/demand/reporting", label: "Creative Reports" }
      ]
    }
  ];
}

function exchangeSidebar(isAdmin: boolean): NavSection[] {
  const sections: NavSection[] = [
    {
      label: "Exchange",
      items: [
        { href: "/platform", label: "Auction Monitor" },
        { href: "/platform/auction-log", label: "Auction Log" },
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
      label: "Analytics Hub",
      items: [
        { href: "/platform/reports/exchange", label: "Exchange Reports" },
        { href: "/platform/reports/publishers", label: "Publisher Reports" },
        { href: "/platform/reports/demand", label: "Demand Reports" },
        { href: "/platform/reports/finance", label: "Revenue & Finance" },
        { href: "/platform/reports/custom", label: "Custom Report Builder" }
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
    }
  ];

  if (isAdmin) {
    sections.push({
      label: "ADMIN",
      items: [
        { href: "/platform/admin/users", label: "User Management" },
        { href: "/platform/admin/roles", label: "Roles & Permissions" },
        { href: "/platform/admin/activity", label: "Activity Log" },
        { href: "/platform/admin/api-keys", label: "API Keys" },
        { href: "/platform/admin/webhooks", label: "Webhooks" },
        { href: "/platform/admin/notifications", label: "Notifications" },
        { href: "/platform/admin/settings", label: "Global Settings" },
        { href: "/platform/admin/access", label: "Access & Auth" },
        { href: "/platform/admin/activity", label: "Change History" },
        { href: "/platform/admin/policy", label: "Policy Centre" }
      ]
    });
  }

  return sections;
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
  const role = session?.user?.role;
  const isAdmin = role === "admin";
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

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
            ? exchangeSidebar(Boolean(isAdmin))
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

  const displayName = useMemo(() => {
    const n = (session?.user as any)?.name;
    if (typeof n === "string" && n.trim()) return n.trim();
    return "User";
  }, [session?.user]);
  const displayEmail = useMemo(() => {
    const e = session?.user?.email;
    if (typeof e === "string" && e.trim()) return e.trim();
    return "—";
  }, [session?.user?.email]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAvatarOpen(false);
    }
    function onMouseDown(e: MouseEvent) {
      const el = avatarRef.current;
      if (!el) return;
      if (e.target && el.contains(e.target as Node)) return;
      setAvatarOpen(false);
    }
    if (avatarOpen) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", onMouseDown);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [avatarOpen]);

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
            {!role && (
              <Link href="/" className={pillClass(platformActive)}>
                Platform
              </Link>
            )}
            {(!role || role === "publisher" || role === "admin") && (
              <Link href="/publisher" className={pillClass(publisherActive)}>
                Publisher Console
              </Link>
            )}
            {(!role || role === "advertiser" || role === "admin") && (
              <Link href="/demand" className={pillClass(demandActive)}>
                Demand Manager
              </Link>
            )}
            {role === "admin" && (
              <Link href="/platform" className={pillClass(exchangeActive && !adminConsoleActive)}>
                Platform
              </Link>
            )}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="btn-ghost" aria-label="Notifications" style={{ padding: 8 }}>
            🔔
          </button>
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
              onClick={() => setAvatarOpen((v) => !v)}
              title={displayEmail}
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
                fontWeight: 700,
                border: "1px solid var(--border)",
                cursor: "pointer"
              }}
            >
              {displayEmail.slice(0, 2).toUpperCase() || "RD"}
            </button>

            {avatarOpen ? (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  width: 260,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  zIndex: 200
                }}
              >
                <div style={{ padding: "12px 12px 10px" }}>
                  <div style={{ fontWeight: 800, color: "var(--text)" }}>{displayName}</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: "var(--text-muted)" }}>{displayEmail}</div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "4px 10px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        border: "1px solid var(--border)",
                        background: isAdmin ? "#1a56db22" : "rgba(113,128,150,0.18)",
                        color: isAdmin ? "#1a56db" : "var(--text-muted)"
                      }}
                    >
                      {String(role ?? "user")}
                    </span>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }} />
                <div style={{ padding: 6, display: "grid", gap: 2 }}>
                  <Link
                    href={isAdmin ? "/platform/admin/settings" : "/platform/settings"}
                    className="shell-nav-item"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href={isAdmin ? "/platform/admin/access" : "/platform/settings"}
                    className="shell-nav-item"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Change Password
                  </Link>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }} />
                <div style={{ padding: 6 }}>
                  <button
                    type="button"
                    className="shell-nav-item"
                    style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                    onClick={() => {
                      setAvatarOpen(false);
                      void signOut({ callbackUrl: "https://adsgupta.com" });
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}
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
