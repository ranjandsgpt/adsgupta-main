import Link from "next/link";

export default function PublisherLoginPage() {
  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "var(--text-bright)", marginTop: 0 }}>
        Publisher access
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
        The publisher dashboard is available without a password. Use the link from your registration email, or open{" "}
        <code style={{ color: "var(--accent)" }}>/publisher/dashboard?id=YOUR_PUBLISHER_UUID</code>.
      </p>
      <div className="card" style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0 }}>
          If your organization uses SSO for internal tools, you can also{" "}
          <Link href="/login?portal=publisher" style={{ color: "var(--accent)" }}>
            sign in here
          </Link>{" "}
          for authenticated API routes.
        </p>
        <Link href="/publisher/dashboard" style={{ display: "inline-block", marginTop: 12 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 16px",
              background: "#0066cc22",
              border: "1px solid #0066cc55",
              color: "var(--accent)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            Open dashboard →
          </span>
        </Link>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 24 }}>
        New to MDE?{" "}
        <Link href="/publisher/register" style={{ color: "var(--accent)" }}>
          Register your site
        </Link>
      </p>
    </div>
  );
}
