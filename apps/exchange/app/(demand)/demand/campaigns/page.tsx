export const dynamic = "force-dynamic";

export default function DemandCampaignsPage() {
  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Campaigns</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        Create and tune bids via <code>/api/campaigns</code>. Optional env{" "}
        <code>EXCHANGE_DEMAND_ADVERTISER</code> locks seat rows when set.
      </p>
    </div>
  );
}
