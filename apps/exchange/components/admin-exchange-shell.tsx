"use client";

import { LiveAuctionTicker } from "@/components/live-auction-ticker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

const C = {
  bg: "#0a0e17",
  bgCard: "#0f1419",
  bgSide: "#080c14",
  border: "#1a2332",
  text: "#c8d6e5",
  textMuted: "#5a6d82",
  textBright: "#e8f0f8",
  accent: "#00d4aa",
  blue: "#4a9eff",
  orange: "#ff8c42",
  red: "#ff4757",
  green: "#2ecc71",
  purple: "#a855f7",
  yellow: "#ffd32a"
};

const NAV = [
  { href: "/admin", icon: "◉", label: "Dashboard", color: C.accent },
  { href: "/admin/analytics", icon: "📈", label: "Analytics", color: C.green },
  { href: "/admin/publishers", icon: "▦", label: "Publishers", color: C.blue },
  { href: "/admin/earnings", icon: "$", label: "Earnings", color: C.green },
  { href: "/admin/demand", icon: "⚡", label: "Demand", color: C.purple },
  { href: "/admin/inventory", icon: "▦", label: "Inventory", color: C.blue },
  { href: "/admin/pricing", icon: "△", label: "Yield", color: C.green },
  { href: "/admin/health", icon: "♥", label: "Health", color: C.red },
  { href: "/admin/auction-log", icon: "◧", label: "Auction Log", color: C.yellow },
  { href: "/admin/tags", icon: "⟨/⟩", label: "Tags", color: C.blue },
  { href: "/admin/protections", icon: "◈", label: "Protections", color: C.red },
  { href: "/admin/ai", icon: "✦", label: "AI Studio", color: "#ff6b9d" },
  { href: "/admin/settings", icon: "⚙", label: "Settings", color: C.textMuted }
] as const;

export function AdminExchangeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const match = useCallback(
    (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href + "/")),
    [pathname]
  );

  const current = NAV.find((n) => match(n.href));

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: C.text,
        lineHeight: 1.5,
        background: C.bg,
        minHeight: "100vh",
        display: "flex"
      }}
    >
      <aside
        style={{
          width: collapsed ? 52 : 220,
          background: C.bgSide,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          flexShrink: 0,
          overflow: "hidden"
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            padding: collapsed ? "14px 8px" : "14px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            background: "transparent",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            width: "100%",
            textAlign: "left",
            fontFamily: "inherit"
          }}
        >
          <Link
            href="/"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "linear-gradient(135deg,#00d4aa,#4a9eff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 900,
              color: "#080c14",
              flexShrink: 0,
              textDecoration: "none"
            }}
          >
            M
          </Link>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>
                MyExchange
              </div>
              <div style={{ fontSize: 9, color: C.textMuted }}>Exchange admin</div>
            </div>
          )}
        </button>
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {NAV.map((n) => {
            const active = match(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 14px" : "9px 16px",
                  cursor: "pointer",
                  background: active ? n.color + "12" : "transparent",
                  borderLeft: active ? `2px solid ${n.color}` : "2px solid transparent",
                  color: active ? n.color : C.textMuted,
                  transition: "all 0.15s",
                  textDecoration: "none"
                }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>
                  {n.icon}
                </span>
                {!collapsed && (
                  <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{n.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 9, color: C.textMuted }}>
            <div>exchange.adsgupta.com</div>
            <div style={{ marginTop: 2 }}>v0.1.0</div>
          </div>
        )}
      </aside>

      <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        <header
          style={{
            background: C.bgSide,
            borderBottom: `1px solid ${C.border}`,
            padding: "10px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textBright }}>
            {current?.icon} {current?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
            <LiveAuctionTicker />
            <div
              style={{
                background: C.green + "18",
                border: `1px solid ${C.green}44`,
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 600,
                color: C.green,
                flexShrink: 0
              }}
            >
              ● LIVE
            </div>
            <div
              style={{
                background: "#0c1018",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.textBright,
                padding: "5px 10px",
                fontSize: 11,
                width: 200
              }}
            >
              ⌘K Search…
            </div>
          </div>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
