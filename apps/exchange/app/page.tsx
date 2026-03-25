"use client";

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicStats = {
  auctionsToday: number;
  activePublishers: number;
  activeCampaigns: number;
  avgCpmLast7d: number;
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AdsGupta Ad Ecosystem",
  applicationCategory: "BusinessApplication",
  description: "Unified ad exchange platform for publishers and advertisers",
  url: "https://exchange.adsgupta.com"
};

type ProductCard = {
  iconBg: string;
  name: string;
  badge: "Live" | "Beta" | "Coming Soon";
  desc: string;
  links: Array<{ label: string; href: string }>;
  disabled?: boolean;
};

const PRODUCTS: ProductCard[] = [
  {
    iconBg: "#1a56db",
    name: "Publisher Portal",
    badge: "Live",
    desc: "Inventory management, yield optimization, ad serving.",
    links: [
      { label: "Register", href: "/publisher/register" },
      { label: "Dashboard", href: "/publisher/dashboard" }
    ]
  },
  {
    iconBg: "#7c3aed",
    name: "Demand Manager",
    badge: "Live",
    desc: "AI campaign planning, creative studio, attribution.",
    links: [
      { label: "Create Campaign", href: "/demand/create" },
      { label: "Manage", href: "/demand/dashboard" }
    ]
  },
  {
    iconBg: "#1e3a5f",
    name: "MDE Exchange",
    badge: "Live",
    desc: "OpenRTB 2.6 real-time auctions. Sub-100ms clearing.",
    links: [{ label: "Auction Monitor", href: "/admin" }]
  },
  {
    iconBg: "#ea580c",
    name: "Prebid Portal",
    badge: "Beta",
    desc: "500+ adapters, header bidding, Prebid.js builder.",
    links: [{ label: "Adapter Library", href: "/docs/mde-js-reference" }]
  },
  {
    iconBg: "#b42318",
    name: "Admin Console",
    badge: "Live",
    desc: "User management, billing, compliance, API keys.",
    links: [{ label: "Open Console", href: "/admin" }]
  },
  {
    iconBg: "#0d9488",
    name: "AI Copilot",
    badge: "Coming Soon",
    desc: "Natural language queries, autonomous optimization.",
    links: [],
    disabled: true
  }
];

function badgeClass(b: ProductCard["badge"]) {
  if (b === "Live") return "badge badge-green";
  if (b === "Beta") return "badge badge-yellow";
  return "badge badge-gray";
}

export default function PlatformHomePage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/public/stats", { cache: "no-store" });
        const j = (await r.json()) as PublicStats;
        if (!cancelled) setStats(j);
      } catch {
        if (!cancelled) setStats(null);
      }
    }
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const name = "Ranjan";

  return (
    <div className="page-content" style={{ paddingBottom: 48 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CookieConsentBanner />

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", margin: 0 }}>
          {greeting()}, {name}
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 13 }}>
          AdsGupta Ad Ecosystem · All portals
        </p>
      </div>

      <div className="card" style={{ marginTop: 20, padding: "14px 18px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 16 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Exchange Live</span>
          </div>
          {[
            { label: "Auctions today", val: stats?.auctionsToday ?? "—" },
            { label: "Active publishers", val: stats?.activePublishers ?? "—" },
            { label: "Active campaigns", val: stats?.activeCampaigns ?? "—" },
            {
              label: "Avg CPM",
              val: stats != null ? `$${Number(stats.avgCpmLast7d).toFixed(2)}` : "—"
            }
          ].map((item, i) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 ? (
                <span style={{ width: 1, height: 28, background: "var(--border)", margin: "0 16px" }} />
              ) : null}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                  {typeof item.val === "number" ? item.val.toLocaleString() : item.val}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "28px 0 12px", color: "var(--text2)" }}>Products</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 10
        }}
      >
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className={`card${p.disabled ? "" : " product-tile-interactive"}`}
            style={{
              padding: 16,
              cursor: p.disabled ? "default" : "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              opacity: p.disabled ? 0.85 : 1
            }}
            onClick={() => {
              if (!p.disabled && p.links[0]) window.location.href = p.links[0].href;
            }}
            onKeyDown={(e) => {
              if (!p.disabled && p.links[0] && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                window.location.href = p.links[0].href;
              }
            }}
            role={p.disabled ? undefined : "link"}
            tabIndex={p.disabled ? -1 : 0}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: p.iconBg,
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                  <span className={badgeClass(p.badge)}>{p.badge}</span>
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {p.desc}
                </p>
                {!p.disabled && p.links.length > 0 ? (
                  <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                    {p.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
          <Link href="/privacy">Privacy Policy</Link>
          <a href="https://adsgupta.com/terms">Terms</a>
          <Link href="/docs">Documentation</Link>
          <Link href="/status">Status</Link>
          <a href="mailto:hello@adsgupta.com">Contact</a>
        </div>
        <div style={{ textAlign: "center" }}>© {new Date().getFullYear()} AdsGupta — exchange.adsgupta.com</div>
      </footer>
    </div>
  );
}
