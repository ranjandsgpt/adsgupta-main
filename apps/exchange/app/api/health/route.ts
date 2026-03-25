export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { getAuctionLatencyStats } from "@/lib/auction-latency";
import { getRecentErrors } from "@/lib/recent-errors";
import { getActiveSseConnections } from "@/lib/sse-metrics";

export async function GET() {
  const started = Date.now();
  const checks: Record<string, unknown> = {};

  try {
    const dbStart = Date.now();
    await sql`SELECT 1`;
    checks.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = { status: "down", error: e instanceof Error ? e.message : String(e) };
  }

  try {
    const latencies = await sql<{ processing_ms: string | null }>`
      SELECT processing_ms::text FROM auction_log
      WHERE processing_ms IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const ms = latencies.rows
      .map((r) => Number(r.processing_ms))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
    const p95 = ms.length ? ms[Math.floor(ms.length * 0.95)] ?? ms[ms.length - 1] : 0;
    const p50 = ms.length ? ms[Math.floor(ms.length * 0.5)] ?? 0 : 0;
    checks.auction = {
      status: ms.length > 0 ? (p95 < 500 ? "healthy" : "degraded") : "unknown",
      p50Ms: p50,
      p95Ms: p95,
      sampleSize: ms.length
    };
  } catch (e) {
    checks.auction = { status: "unknown", error: e instanceof Error ? e.message : String(e) };
  }

  const lat = getAuctionLatencyStats();
  checks.auctionRequest = {
    status: lat.samples === 0 ? "unknown" : lat.p95Ms < 2500 ? "healthy" : "degraded",
    avgLatencyMs: Math.round(lat.avgMs * 10) / 10,
    p95LatencyMs: lat.p95Ms,
    samples: lat.samples
  };

  checks.blob = {
    status: process.env.BLOB_READ_WRITE_TOKEN ? "healthy" : "degraded",
    note: process.env.BLOB_READ_WRITE_TOKEN ? "Token configured" : "No token — creative uploads unavailable"
  };

  try {
    const errors = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c FROM admin_activity_log
      WHERE action_type = 'error' AND created_at > now() - interval '1 hour'
    `;
    checks.recentErrors = { count: Number(errors.rows[0]?.c ?? 0) };
  } catch {
    checks.recentErrors = { count: 0, note: "admin_activity_log query failed" };
  }

  try {
    const stats = await sql<{ auctions: string; impressions: string }>`
      SELECT
        COUNT(*)::text AS auctions,
        COUNT(*) FILTER (WHERE cleared = true)::text AS impressions
      FROM auction_log
      WHERE created_at::date = CURRENT_DATE
    `;
    checks.exchangeStats = {
      auctionsToday: Number(stats.rows[0]?.auctions ?? 0),
      impressionsToday: Number(stats.rows[0]?.impressions ?? 0)
    };
  } catch {
    checks.exchangeStats = {};
  }

  let fillRow: { rows: { fr: string; c: string }[] };
  try {
    fillRow = await sql<{ fr: string; c: string }>`
      SELECT
        (COUNT(*) FILTER (WHERE cleared) * 100.0 / NULLIF(COUNT(*), 0))::text AS fr,
        COUNT(*)::text AS c
      FROM auction_log
      WHERE created_at > now() - interval '1 hour'
    `;
  } catch {
    fillRow = { rows: [{ fr: "0", c: "0" }] };
  }

  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
  const fillRate1h = Number(fillRow.rows[0]?.fr ?? 0);
  const auctionsLast1h = Number(fillRow.rows[0]?.c ?? 0);

  const impr1h = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c FROM impressions WHERE created_at > now() - interval '1 hour'
  `;
  const avgBid = await sql<{ v: string }>`
    SELECT COALESCE(AVG(winning_bid), 0)::text AS v
    FROM auction_log
    WHERE created_at > now() - interval '1 hour' AND cleared = true AND winning_bid IS NOT NULL
  `;

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
  if ((checks.database as { status?: string })?.status === "down") status = "down";
  else if (
    (checks.database as { status?: string })?.status === "degraded" ||
    (checks.auctionRequest as { status?: string })?.status === "degraded" ||
    !blobConfigured
  ) {
    status = "degraded";
  }

  return Response.json({
    status,
    checks,
    uptimeMs: Date.now() - started,
    timestamp: new Date().toISOString(),
    metrics: {
      auctionsLast1h,
      impressionsLast1h: Number(impr1h.rows[0]?.c ?? 0),
      fillRateLast1h: Math.round(fillRate1h * 100) / 100,
      avgBidPriceLast1h: Math.round(Number(avgBid.rows[0]?.v ?? 0) * 10000) / 10000,
      activeCampaigns: Number(camps.rows[0]?.c ?? 0),
      activePublishers: Number(pubs.rows[0]?.c ?? 0),
      activeSseConnections: getActiveSseConnections(),
      auctionsSpark24h,
      fillSpark24h
    },
    recentErrors: getRecentErrors().slice(0, 20)
  });
}
