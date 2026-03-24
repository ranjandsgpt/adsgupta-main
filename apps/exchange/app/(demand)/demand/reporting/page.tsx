export const dynamic = "force-dynamic";

export default function DemandReportingPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Reporting</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Seat-level totals from <code>/api/reports/dashboard</code> (demand scope).
      </p>
    </div>
  );
}
