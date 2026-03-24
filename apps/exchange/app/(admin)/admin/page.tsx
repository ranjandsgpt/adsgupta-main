export const dynamic = "force-dynamic";

import { LoadErrorBanner } from "@/components/load-error-banner";
import { getDashboardPayload } from "@/lib/get-dashboard";
import { getAuthContextFromSession } from "@/lib/session-auth";

export default async function AdminDashboardPage() {
  const auth = await getAuthContextFromSession();
  const data = auth ? await getDashboardPayload(auth) : null;

  return (
    <div>
      <LoadErrorBanner message={data?.loadError} />
      <h1 style={{ color: "var(--text-bright)", marginTop: 0 }}>Exchange overview</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>
        Global KPIs across all publishers and demand (scope: {data?.scope ?? "—"}).
      </p>
      <div className="kpis">
        <div className="card">
          <div>Total auctions</div>
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
          <div>Clearing (sum bids logged)</div>
          <strong>${Number(data?.totalRevenue ?? 0).toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
}
