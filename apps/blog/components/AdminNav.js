"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout(e) {
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
      <Link href="/admin" className="header-nav-link" style={{ textDecoration: "none" }}>
        Post Manager
      </Link>
      <Link href="/admin/posts/new" className="header-nav-link" style={{ textDecoration: "none" }}>
        New Article
      </Link>
      <Link href="/admin/monetization" className="header-nav-link" style={{ textDecoration: "none" }}>
        Monetization
      </Link>
      <Link href="/admin/import/linkedin" className="header-nav-link" style={{ textDecoration: "none" }}>
        Sync LinkedIn
      </Link>
      <Link href="/admin/import/blogspot" className="header-nav-link" style={{ textDecoration: "none" }}>
        Import Blogspot
      </Link>
      <span style={{ flex: 1 }} />
      <button type="button" onClick={handleLogout} className="header-btn header-btn-ghost" style={{ cursor: "pointer" }}>
        Logout
      </button>
<Link href="/archives" className="header-nav-link" style={{ textDecoration: "none" }}>
          View Archives
        </Link>
    </nav>
  );
}
