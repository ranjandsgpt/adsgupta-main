import Link from "next/link";

export default function ExchangeReportsPage() {
  return (
    <div className="page-content" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ margin: 0, fontSize: 18, color: "var(--text-bright)" }}>Exchange Reports</h1>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
        Exchange-wide analytics (admin only).
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ padding: 14, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Quick links</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-secondary" href="/platform/analytics">
              Legacy Analytics
            </Link>
            <Link className="btn-secondary" href="/platform/auction-log">
              Auction Log
            </Link>
            <Link className="btn-secondary" href="/platform/earnings">
              Earnings
            </Link>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            This hub is being split into Exchange / Publisher / Demand / Finance views.
          </div>
        </div>
      </div>
    </div>
  );
}

