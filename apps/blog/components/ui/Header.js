"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, children }) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`nav-link ${active ? "nav-link-active" : ""}`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="shell-wide header-inner">
        <Link href="/">
          <div className="logo-mark">
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.85)",
                background:
                  "radial-gradient(circle at 0 0, #00ffff, transparent 60%), radial-gradient(circle at 100% 100%, #0f172a, #020617 70%)",
                boxShadow: "0 0 16px rgba(34,211,238,0.9)",
              }}
            />
          </div>
          <div className="logo-text">
            <span className="logo-title">AdsGupta</span>
            <span className="logo-subtitle">Ad-Tech Intelligence</span>
          </div>
        </Link>
        <nav className="nav">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/archives">The Archives</NavLink>
          <a
            href="https://tools.adsgupta.com"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Tools
          </a>
          <a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            DemoAI
          </a>
          <a
            href="https://adsgupta.com"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Main Site
          </a>
        </nav>
      </div>
    </header>
  );
}

