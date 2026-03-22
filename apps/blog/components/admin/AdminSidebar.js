"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const BG = "#1a1d24";
const ACCENT = "#06b6d4";
const MUTED = "rgba(255,255,255,0.55)";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/posts", label: "Posts", icon: "▤" },
  { href: "/admin/posts/new", label: "New Article", icon: "＋" },
  { href: "/admin/media", label: "Media", icon: "▣" },
  { href: "/admin/monetization", label: "Monetization", icon: "$" },
  { href: "/admin/social", label: "Social Sync", icon: "◎" },
  { href: "/admin/analytics", label: "Analytics", icon: "▦" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "✉" },
  { href: "/admin/ai", label: "AI Tools", icon: "✦" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <aside
      style={{
        width: "100%",
        maxWidth: "260px",
        minHeight: "100%",
        background: BG,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "1rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
      className="admin-sidebar"
    >
      <div style={{ padding: "0 0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: ACCENT, letterSpacing: "0.02em" }}>
          ADSGUPTA BlogAI
        </div>
        {status === "authenticated" && session?.user && (
          <div style={{ marginTop: "0.65rem", fontSize: "0.78rem", color: MUTED, lineHeight: 1.4 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{session.user.name || "Author"}</div>
            <div style={{ wordBreak: "break-all" }}>{session.user.email}</div>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem", flex: 1 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.45rem",
                textDecoration: "none",
                fontSize: "0.86rem",
                color: active ? "#0f1115" : MUTED,
                background: active ? ACCENT : "transparent",
                fontWeight: active ? 600 : 500,
              }}
            >
              <span aria-hidden style={{ width: "1.1rem", textAlign: "center", opacity: 0.9 }}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="header-btn header-btn-ghost"
        style={{
          marginTop: "auto",
          fontSize: "0.82rem",
          padding: "0.5rem",
          cursor: "pointer",
          borderRadius: "0.45rem",
          border: "1px solid rgba(255,255,255,0.12)",
          color: MUTED,
        }}
      >
        Logout
      </button>

    </aside>
  );
}
