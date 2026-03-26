"use client";

import { LiveAuctionTicker } from "@/components/live-auction-ticker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const C = {
  bg: "#ffffff",
  bgCard: "#f8f9fa",
  bgSide: "#f1f3f5",
  border: "#e2e8f0",
  text: "#1a202c",
  textMuted: "#718096",
  textBright: "#e8f0f8",
  accent: "#0066cc",
  blue: "#4a9eff",
  orange: "#ff8c42",
  red: "#ff4757",
  green: "#2ecc71",
  purple: "#a855f7",
  yellow: "#ffd32a"
};

const NAV = [
  { href: "/platform/quickstart", icon: "⚡", label: "Quick Start", color: C.accent },
  { href: "/platform", icon: "◉", label: "Dashboard", color: C.accent },
  { href: "/platform/analytics", icon: "📈", label: "Analytics", color: C.green },
  { href: "/platform/publishers", icon: "▦", label: "Publishers", color: C.blue },
  { href: "/platform/earnings", icon: "$", label: "Earnings", color: C.green },
  { href: "/platform/demand", icon: "⚡", label: "Demand", color: C.purple },
  { href: "/platform/inventory", icon: "▦", label: "Inventory", color: C.blue },
  { href: "/platform/pricing", icon: "△", label: "Yield", color: C.green },
  { href: "/platform/health", icon: "♥", label: "Health", color: C.red },
  { href: "/platform/auction-log", icon: "◧", label: "Auction Log", color: C.yellow },
  { href: "/platform/tags", icon: "⟨/⟩", label: "Tags", color: C.blue },
  { href: "/platform/protections", icon: "◈", label: "Protections", color: C.red },
  { href: "/platform/ai", icon: "✦", label: "AI Studio", color: "#ff6b9d" },
  { href: "/platform/settings", icon: "⚙", label: "Settings", color: C.textMuted },
  { href: "/platform/activity-log", icon: "🕘", label: "Activity Log", color: C.yellow },
  { href: "/platform/test", icon: "✓", label: "E2E Test", color: C.green }
] as const;

export function AdminExchangeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notifs, setNotifs] = useState<
    Array<{
      id: string;
      type: string;
      message: string;
      entityId?: string;
      entityType?: string;
      read: boolean;
      createdAt: string;
    }>
  >([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const match = useCallback(
    (href: string) => pathname === href || (href !== "/platform" && pathname.startsWith(href + "/")),
    [pathname]
  );

  const current = NAV.find((n) => match(n.href));

  const refreshNotifs = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/notifications", { credentials: "include" });
      const j = await r.json();
      if (Array.isArray(j)) setNotifs(j);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refreshNotifs();
    const id = setInterval(() => void refreshNotifs(), 30_000);
    return () => clearInterval(id);
  }, [refreshNotifs]);

  const notifCount = notifs.length;

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
              background: "linear-gradient(135deg,#0066cc,#4a9eff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 900,
              color: "#f1f3f5",
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

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                style={{
                  cursor: "pointer",
                  background: "#0c1018",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "7px 10px",
                  color: C.textBright,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10
                }}
                aria-label="Notifications"
              >
                <span style={{ fontSize: 14 }}>🔔</span>
                {!notifCount ? null : (
                  <span
                    style={{
                      background: C.accent + "22",
                      border: `1px solid ${C.accent}55`,
                      color: C.accent,
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 11
                    }}
                  >
                    {notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: 360,
                    zIndex: 10,
                    background: C.bgSide,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontWeight: 900, color: C.textBright, fontSize: 12 }}>
                    Notifications
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: 14, color: C.textMuted, fontSize: 12 }}>No unread notifications.</div>
                    ) : (
                      notifs.slice(0, 10).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch(`/api/admin/notifications/${encodeURIComponent(n.id)}`, {
                                method: "PATCH",
                                credentials: "include"
                              });
                            } finally {
                              setNotifOpen(false);
                              void refreshNotifs();
                            }
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 12px",
                            background: "transparent",
                            border: "none",
                            borderBottom: `1px solid ${C.border}`,
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ fontWeight: 900, color: C.textBright, fontSize: 12 }}>
                            {n.type.replaceAll("_", " ")}
                          </div>
                          <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>{n.message}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
