"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (status === "loading") {
    return (
      <span className="blog-header__login blog-header__login--ghost" aria-busy="true">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link href="/admin/login" className="blog-header__login">
        Login
      </Link>
    );
  }

  const name = session.user.name || session.user.email || "User";
  const initial = String(name).trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="blog-header__user" ref={wrapRef}>
      <button
        type="button"
        className="blog-header__user-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="blog-header__user-avatar" aria-hidden>
          {initial}
        </span>
        <span className="blog-header__user-name">{name}</span>
      </button>
      {open ? (
        <div className="blog-header__user-menu" role="menu">
          <Link href="/admin/settings" className="blog-header__user-link" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <button
            type="button"
            className="blog-header__user-link blog-header__user-link--btn"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
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
