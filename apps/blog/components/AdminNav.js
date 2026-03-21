"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase.js";

const accent = "#06b6d4";
const muted = "rgba(255,255,255,0.55)";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Post Manager" },
  { href: "/admin/posts/new", label: "New Article" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/monetization", label: "Monetization" },
  { href: "/admin/social", label: "Social Sync" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/ai", label: "AI Tools" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      await fetch("/api/auth/logout", { method: "POST", redirect: "manual" });
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        marginBottom: "1.75rem",
        padding: "1rem 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem 0.5rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700, color: accent, marginRight: "0.5rem", fontSize: "0.95rem" }}>CMS</span>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                textDecoration: "none",
                fontSize: "0.82rem",
                padding: "0.35rem 0.6rem",
                borderRadius: "0.4rem",
                color: active ? "#0f1115" : muted,
                background: active ? accent : "transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </Link>
          );
        })}
        <span style={{ flex: 1, minWidth: "8px" }} />
        <Link href="/archives" style={{ fontSize: "0.82rem", color: accent }} target="_blank" rel="noreferrer">
          View blog
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="header-btn header-btn-ghost"
          style={{ cursor: "pointer", fontSize: "0.82rem", padding: "0.35rem 0.65rem" }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
