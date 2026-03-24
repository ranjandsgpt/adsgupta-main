export const dynamic = "force-dynamic";

async function getDashboard() {
  const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/reports/dashboard`, {
    cache: "no-store"
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboard();
  return (
    <div>
      <h1>Exchange Overview</h1>
      <div className="kpis">
        <div className="card"><div>Total Auctions</div><strong>{data?.totalAuctions ?? 0}</strong></div>
        <div className="card"><div>Total Impressions</div><strong>{data?.totalImpressions ?? 0}</strong></div>
        <div className="card"><div>Total Clicks</div><strong>{data?.totalClicks ?? 0}</strong></div>
        <div className="card"><div>Revenue</div><strong>${data?.totalRevenue ?? 0}</strong></div>
      </div>
    </div>
  );
}
