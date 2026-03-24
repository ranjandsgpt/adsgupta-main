export const dynamic = "force-dynamic";

export default function AdminYieldPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Yield &amp; pricing</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Unified pricing rules via <code>/api/pricing-rules</code> (admin-only writes).
      </p>
    </div>
  );
}
