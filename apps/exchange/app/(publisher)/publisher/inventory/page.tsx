export const dynamic = "force-dynamic";

export default function PublisherInventoryPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Ad units</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        List and manage placements via <code>/api/inventory</code> (scoped to your publisher).
      </p>
    </div>
  );
}
