export const dynamic = "force-dynamic";

export default function AdminDeliveryPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Delivery</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Orders and line-item UX shell · data via <code>/api/campaigns</code> and{" "}
        <code>/api/creatives</code>.
      </p>
    </div>
  );
}
