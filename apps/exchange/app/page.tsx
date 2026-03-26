import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "AdsGupta — Programmatic Advertising Platform",
  description: "Real-time auctions. Self-serve onboarding. Enterprise controls. No contracts."
};

type SessionUserLike = {
  role?: string;
  publisherId?: string | null;
  publisherIds?: string[] | null;
  campaignEmail?: string | null;
  email?: string | null;
};

function roleRedirect(session: { user?: SessionUserLike } | null): string | null {
  const role = session?.user?.role;
  if (!role) return null;
  if (role === "admin") return "/platform";
  if (role === "publisher") {
    const ids = session.user?.publisherIds ?? [];
    const id = ids?.[0] ?? session.user?.publisherId ?? "";
    return id ? `/publisher/dashboard?id=${encodeURIComponent(id)}` : "/publisher/dashboard";
  }
  const email = session.user?.campaignEmail ?? session.user?.email ?? "";
  return email ? `/demand/dashboard?email=${encodeURIComponent(email)}` : "/demand/dashboard";
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>
      {children}
    </Link>
  );
}

export default async function HomePage() {
  const session = (await getServerSession(authOptions)) as { user?: SessionUserLike } | null;
  const dest = roleRedirect(session);
  if (dest) redirect(dest);

  return (
    <div style={{ padding: "28px 18px 64px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)" }} />
          <div style={{ fontWeight: 900, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>AdsGupta</div>
        </div>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <NavLink href="/docs">Developers</NavLink>
          <NavLink href="/publisher/register">Publishers</NavLink>
          <NavLink href="/register">Advertisers</NavLink>
          <NavLink href="/docs/api-reference">Pricing</NavLink>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </div>

      <div style={{ paddingTop: 80, textAlign: "center" }}>
        <h1 style={{ margin: "0 auto 14px", fontSize: 44, maxWidth: 900, lineHeight: 1.05, color: "var(--text-bright)" }}>
          The Programmatic Advertising Platform
        </h1>
        <p style={{ margin: "0 auto 22px", maxWidth: 760, fontSize: 15, lineHeight: 1.7, color: "var(--text-muted)" }}>
          Real-time auctions. Self-serve onboarding. Enterprise controls. No contracts.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/publisher/register" className="btn-primary">
            Start monetizing →
          </Link>
          <Link href="/register" className="btn-secondary">
            Start advertising →
          </Link>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 36,
          padding: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          textAlign: "center"
        }}
      >
        {["OpenRTB 2.6", "<100ms latency", "Self-serve", "No contracts"].map((x) => (
          <div key={x} style={{ padding: 10 }}>
            <div style={{ fontWeight: 900, color: "var(--text)" }}>{x}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 8 }}>Publisher Console</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Monetize your inventory with real programmatic auctions.
          </div>
          <div style={{ marginTop: 14 }}>
            <Link href="/publisher/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 8 }}>Demand Manager</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Run campaigns across publisher inventory.
          </div>
          <div style={{ marginTop: 14 }}>
            <Link href="/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, color: "var(--text-bright)", marginBottom: 8 }}>Exchange Platform</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Full platform access for exchange operators.
          </div>
          <div style={{ marginTop: 14 }}>
            <Link href="/login" className="btn-secondary">
              Admin sign in
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: 44, paddingTop: 18, borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div>© 2026 AdsGupta</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/privacy">Privacy</Link>
            <a href="https://adsgupta.com/terms">Terms</a>
            <Link href="/docs">Docs</Link>
            <Link href="/status">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
