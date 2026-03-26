import Link from "next/link";

export default function FinanceReportsPage() {
  return (
    <div className="page-content" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ margin: 0, fontSize: 18, color: "var(--text-bright)" }}>Revenue &amp; Finance</h1>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
        Platform revenue and publisher payouts (admin only).
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ padding: 14, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>Quick links</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-secondary" href="/platform/earnings">
              Earnings
            </Link>
            <Link className="btn-secondary" href="/platform/analytics">
              Legacy Analytics
            </Link>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            This view will include exports and monthly summaries.
          </div>
        </div>
      </div>
    </div>
  );
}

