export const dynamic = "force-dynamic";
import { getAuctionLatencyStats } from "@/lib/auction-latency";
import { getRecentErrors } from "@/lib/recent-errors";
import { sql } from "@/lib/db";
import { getActiveSseConnections } from "@/lib/sse-metrics";

export async function GET() {
  const timestamp = new Date().toISOString();
  const dbStarted = Date.now();
  let database: { status: "healthy" | "degraded" | "down"; latencyMs: number } = { status: "healthy", latencyMs: 0 };
  try {
    await sql`SELECT 1`;
    const lat = Date.now() - dbStarted;
    database = {
      status: lat > 800 ? "degraded" : "healthy",
      latencyMs: lat
    };
  } catch {
    database = { status: "down", latencyMs: Date.now() - dbStarted };
  }

  const lat = getAuctionLatencyStats();
  const fillRow = await sql<{ fr: string; c: string }>`
    SELECT
      (COUNT(*) FILTER (WHERE cleared) * 100.0 / NULLIF(COUNT(*), 0))::text AS fr,
      COUNT(*)::text AS c
    FROM auction_log
    WHERE created_at > now() - interval '1 hour'
  `;
  const fillRate1h = Number(fillRow.rows[0]?.fr ?? 0);
  const auctionsLast1h = Number(fillRow.rows[0]?.c ?? 0);

  const auctionCheckStatus: "healthy" | "degraded" | "down" =
    lat.samples === 0 ? "healthy" : lat.p95Ms < 2500 ? "healthy" : "degraded";

  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
  const blob = { status: (blobConfigured ? "healthy" : "degraded") as "healthy" | "degraded" };

  const impr1h = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c FROM impressions WHERE created_at > now() - interval '1 hour'
  `;
  const impressionsLast1h = Number(impr1h.rows[0]?.c ?? 0);

  const avgBid = await sql<{ v: string }>`
    SELECT COALESCE(AVG(winning_bid), 0)::text AS v
    FROM auction_log
    WHERE created_at > now() - interval '1 hour' AND cleared = true AND winning_bid IS NOT NULL
  `;
  const avgBidPriceLast1h = Number(avgBid.rows[0]?.v ?? 0);

  const camps = await sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'active'`;
  const pubs = await sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'active'`;

  const hourly = await sql<{ h: string; c: string; clr: string }>`
    SELECT
      EXTRACT(HOUR FROM created_at)::int::text AS h,
      COUNT(*)::text AS c,
      COUNT(*) FILTER (WHERE cleared)::text AS clr
    FROM auction_log
    WHERE created_at > now() - interval '24 hours'
    GROUP BY 1
    ORDER BY 1
  `;
  const volMap = new Map(hourly.rows.map((r) => [Number(r.h), Number(r.c)]));
  const fillMap = new Map(
    hourly.rows.map((r) => {
      const t = Number(r.c);
      return [Number(r.h), t > 0 ? (Number(r.clr) / t) * 100 : 0];
    })
  );
  const auctionsSpark24h = Array.from({ length: 24 }, (_, h) => volMap.get(h) ?? 0);
  const fillSpark24h = Array.from({ length: 24 }, (_, h) => fillMap.get(h) ?? 0);

  let status: "healthy" | "degraded" | "down" = "healthy";
  if (database.status === "down") status = "down";
  else if (database.status === "degraded" || auctionCheckStatus === "degraded" || blob.status === "degraded") status = "degraded";

  return Response.json({
    status,
    timestamp,
    checks: {
      database,
      auction: {
        status: auctionCheckStatus,
        avgLatencyMs: Math.round(lat.avgMs * 10) / 10,
        p95LatencyMs: lat.p95Ms,
        fillRate1h: Math.round(fillRate1h * 100) / 100,
        latencyHistogram: lat.histogram,
        samples: lat.samples
      },
      blob
    },
    metrics: {
      auctionsLast1h,
      impressionsLast1h,
      fillRateLast1h: Math.round(fillRate1h * 100) / 100,
      avgBidPriceLast1h: Math.round(avgBidPriceLast1h * 10000) / 10000,
      activeCampaigns: Number(camps.rows[0]?.c ?? 0),
      activePublishers: Number(pubs.rows[0]?.c ?? 0),
      activeSseConnections: getActiveSseConnections(),
      auctionsSpark24h,
      fillSpark24h
    },
    recentErrors: getRecentErrors().slice(0, 20)
  });
}
