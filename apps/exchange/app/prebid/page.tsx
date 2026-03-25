import Link from "next/link";

export default function PrebidPortalPage() {
  return (
    <div className="page-content" style={{ paddingTop: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Prebid Portal</h1>
      <p style={{ color: "var(--muted)", maxWidth: 560, marginBottom: 20 }}>
        Header bidding, 500+ adapters, and Prebid.js builder — launching here soon. Use the docs for integration patterns today.
      </p>
      <Link href="/docs/mde-js-reference" className="btn-primary" style={{ display: "inline-flex", width: "auto" }}>
        View mde.js &amp; integration docs →
      </Link>
    </div>
  );
}
