export const dynamic = "force-dynamic";

export default function AdminReportingPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Reporting</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Aggregates from <code>/api/reports/dashboard</code> (exchange-wide for admins).
      </p>
    </div>
  );
}
