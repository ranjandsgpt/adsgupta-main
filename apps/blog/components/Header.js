"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

function NavLink({ href, children }) {
  return (
    <Link href={href} className="header-nav-link">
      {children}
    </Link>
  );
}

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
      <span className="header-btn header-btn-login" style={{ opacity: 0.65, cursor: "default" }} aria-busy="true">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link href="/admin/login" className="header-btn header-btn-login">
        <svg className="header-login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span>Login</span>
      </Link>
    );
  }

  const name = session.user.name || session.user.email || "User";
  const initial = String(name).trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="header-user-wrap" ref={wrapRef}>
      <button
        type="button"
        className="header-user-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="header-user-avatar" aria-hidden>
          {initial}
        </span>
        <span className="header-user-name">{name}</span>
        <span className="header-dropdown-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="header-dropdown-menu header-user-dropdown" role="menu">
          <Link href="/admin/settings" className="header-dropdown-link" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <button
            type="button"
            className="header-dropdown-link header-dropdown-link-button"
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
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="shell-wide header-inner">
        <div className="header-left">
          <Link href="/" className="header-logo" aria-label="ADSGUPTA BlogAI — blog.adsgupta.com">
            <span className="header-logo-text">
              <span className="header-logo-ads">ADS</span>
              <span className="header-logo-gupta">GUPTA</span>
            </span>
            <span className="header-blogai-pill">BlogAI</span>
          </Link>
        </div>

        <button
          type="button"
          className="header-menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <nav className={`header-nav ${open ? "header-nav-open" : ""}`}>
          <div className="header-nav-item">
            <NavLink href="/archives">The Archives</NavLink>
          </div>
          <div className="header-nav-item">
            <NavLink href="/series">Series</NavLink>
          </div>
          <div className="header-nav-item">
            <NavLink href="/categories">Categories</NavLink>
          </div>
          <div className="header-nav-item">
            <NavLink href="/search">Search</NavLink>
          </div>
        </nav>

        <div className="header-actions">
          <UserSessionActions />
          <a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noreferrer"
            className="header-btn header-btn-primary"
          >
            Try Demo
          </a>
        </div>
      </div>
    </header>
  );
}
