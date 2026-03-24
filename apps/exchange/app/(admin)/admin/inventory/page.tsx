export const dynamic = "force-dynamic";

export default function AdminInventoryPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Inventory</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Manage publishers and ad units via <code>/api/publishers</code> and <code>/api/inventory</code>{" "}
        (admin-scoped).
      </p>
    </div>
  );
}
