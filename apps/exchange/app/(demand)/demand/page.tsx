export const dynamic = "force-dynamic";

import { LoadErrorBanner } from "@/components/load-error-banner";
import { getDashboardPayload } from "@/lib/get-dashboard";
import { getAuthContextFromSession } from "@/lib/session-auth";

export default async function DemandHomePage() {
  const auth = await getAuthContextFromSession();
  const data = auth ? await getDashboardPayload(auth) : null;

  return (
    <div>
      <LoadErrorBanner message={data?.loadError} />
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Demand overview</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>
        Wins and delivery scoped to your seat
        {data?.advertiser ? ` (${data.advertiser})` : ""}.
      </p>
      <div className="kpis">
        <div className="card">
          <div>Auctions (wins logged)</div>
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
          <div>Spend (bid sum)</div>
          <strong>${Number(data?.totalRevenue ?? 0).toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
}
