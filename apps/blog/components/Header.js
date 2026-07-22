"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const TICKER =
  "Programmatic · Amazon · TikTok Shop · Meta Ads · CTV · GAM · Prebid · Retail Media · Attribution · DCO";

const NAV_TABS = [
  { label: "Programmatic", href: "/#channel-programmatic" },
  { label: "Search & PPC", href: "/#channel-search" },
  { label: "Social Ads", href: "/#channel-social" },
  { label: "Marketplaces", href: "/#channel-marketplaces" },
  { label: "Creative", href: "/#channel-creative" },
  { label: "Data & Measurement", href: "/#channel-data" },
  { label: "CTV", href: "/#channel-ctv" },
  { label: "Agency", href: "/#channel-agency" },
];

function UserSessionActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="blog-header__login blog-header__login--ghost" aria-busy="true">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <a href="https://adsgupta.com/platform/usermanagement" className="blog-header__login">
        Sign In
      </a>
    );
  }

  return (
    <button
      type="button"
      className="blog-header__login"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </button>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="blog-header-wrap">
      <div className="blog-ticker" aria-hidden="true">
        <div className="blog-ticker__track">
          <span className="blog-ticker__text">{TICKER}</span>
          <span className="blog-ticker__text">{TICKER}</span>
        </div>
      </div>

      <header className="blog-header">
        <div className="shell-wide blog-header__inner">
          <div className="blog-header__left">
            <Link href="/" className="blog-header__wordmark" aria-label="AdsGupta Blog home">
              <span className="blog-header__ads">Ads</span>
              <span className="blog-header__gupta">Gupta</span>
              <span className="blog-header__badge">BLOG</span>
            </Link>
          </div>

          <button
            type="button"
            className="blog-header__burger"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`blog-header__nav ${mobileOpen ? "is-open" : ""}`} aria-label="Channels">
            {NAV_TABS.map((t) => (
              <Link key={t.href} href={t.href} className="blog-header__tab" onClick={() => setMobileOpen(false)}>
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="blog-header__right">
            <Link href="/search" className="blog-header__icon-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </Link>
            <a href="#newsletter" className="blog-header__subscribe">
              Subscribe
            </a>
            <UserSessionActions />
          </div>
        </div>
      </header>
    </div>
  );
}
