export const dynamic = "force-dynamic";

import { getDashboardPayload } from "@/lib/get-dashboard";
import { getAuthContextFromSession } from "@/lib/session-auth";

export default async function PublisherHomePage() {
  const auth = await getAuthContextFromSession();
  const data = auth ? await getDashboardPayload(auth) : null;

  return (
    <div>
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Publisher overview</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>
        Metrics scoped to your publisher seat{data?.publisherId ? ` (${data.publisherId})` : ""}. Set
        <code> EXCHANGE_PUBLISHER_ID</code> in production.
      </p>
      <div className="kpis">
        <div className="card">
          <div>Auctions</div>
          <strong>{data?.totalAuctions ?? 0}</strong>
        </div>
        <div className="card">
          <div>Impressions</div>
          <strong>{data?.totalImpressions ?? 0}</strong>
        </div>
        <div className="card">
          <div>Clicks</div>
          <strong>{data?.totalClicks ?? 0}</strong>
        </div>
        <div className="card">
          <div>CTR</div>
          <strong>{Number(data?.ctr ?? 0).toFixed(3)}%</strong>
        </div>
      </div>
    </div>
  );
}
