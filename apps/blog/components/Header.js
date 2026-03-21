"use client";

import Link from "next/link";
import { useState } from "react";

function NavLink({ href, children }) {
  return (
    <Link href={href} className="header-nav-link">
      {children}
    </Link>
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
          <Link
            href="/admin/login"
            className="header-btn header-btn-login"
          >
            <svg className="header-login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Login</span>
          </Link>
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

