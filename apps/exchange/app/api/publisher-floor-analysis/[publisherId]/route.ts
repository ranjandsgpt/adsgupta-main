export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import type { FloorAnalysis, FloorTier } from "@/lib/floor-analysis-types";
import { NextRequest } from "next/server";

const TIERS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0];

function analyzeRows(
  rows: Array<{ winning_bid: string | null; winning_campaign_id: string | null }>
): { tiers: FloorTier[]; optimalFloor: number; optimalRev: number; optimalFill: number } {
  const total = rows.length;
  const filled = (r: (typeof rows)[0]) =>
    r.winning_campaign_id != null && r.winning_bid != null && Number(r.winning_bid) > 0;

  const tiers: FloorTier[] = TIERS.map((floor) => {
    const bidCount = rows.filter((r) => filled(r) && Number(r.winning_bid) >= floor).length;
    const estimatedFillRate = total > 0 ? bidCount / total : 0;
    const estimatedRevenuePer1000 = estimatedFillRate * floor;
    return { floor, estimatedFillRate, estimatedRevenuePer1000, bidCount };
  });

  let optimalFloor = TIERS[0] ?? 0.25;
  let optimalRev = 0;
  let optimalFill = 0;
  for (const t of tiers) {
    if (t.estimatedRevenuePer1000 >= optimalRev) {
      optimalRev = t.estimatedRevenuePer1000;
      optimalFloor = t.floor;
      optimalFill = t.estimatedFillRate;
    }
  }

  return { tiers, optimalFloor, optimalRev, optimalFill };
}

export async function GET(request: NextRequest, { params }: { params: { publisherId: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const publisherId = params.publisherId?.trim() ?? "";
  if (!publisherId) return json({ error: "publisherId required" }, 400);
  if (auth.role === "publisher") {
    const allowed = (auth.publisherIds ?? (auth.publisherId ? [auth.publisherId] : [])).filter(Boolean);
    if (!allowed.includes(publisherId)) return forbidden();
  }
  if (auth.role !== "publisher" && auth.role !== "admin") return forbidden();

  const pub = await sql<{ status: string }>`
    SELECT status FROM publishers WHERE id = ${publisherId} LIMIT 1
  `;
  if (!pub.rows[0]) return json({ error: "Publisher not found" }, 404);
  if (pub.rows[0].status !== "active") {
    return json({ eligible: false, reason: "Publisher must be active", units: [] as FloorAnalysis[] });
  }

  const aucCount = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND al.created_at >= now() - interval '7 days'
  `;
  const totalAuctions = Number(aucCount.rows[0]?.c ?? 0);
  if (totalAuctions < 50) {
    return json({
      eligible: false,
      reason: "Need more than 50 auctions in the last 7 days to analyze floors",
      auctionCount7d: totalAuctions,
      units: [] as FloorAnalysis[]
    });
  }

  const units = await sql<{ id: string; name: string; floor_price: string }>`
    SELECT id, name, floor_price::text
    FROM ad_units
    WHERE publisher_id = ${publisherId} AND status = 'active'
  `;

  const analyses: FloorAnalysis[] = [];

  for (const u of units.rows) {
    const logs = await sql<{
      winning_bid: string | null;
      winning_campaign_id: string | null;
    }>`
      SELECT winning_bid::text, winning_campaign_id
      FROM auction_log
      WHERE ad_unit_id = ${u.id}
        AND created_at >= now() - interval '7 days'
    `;

    const currentFloor = Number(u.floor_price);
    const { tiers, optimalFloor, optimalRev, optimalFill } = analyzeRows(logs.rows);

    const total = logs.rows.length;
    const passCurrent = rowsPassFloor(logs.rows, currentFloor);
    const currentFillRate = total > 0 ? passCurrent / total : 0;
    const currentRevenuePer1000 = currentFillRate * currentFloor;

    let revenueUplift = 0;
    if (currentRevenuePer1000 > 0) {
      revenueUplift = ((optimalRev - currentRevenuePer1000) / currentRevenuePer1000) * 100;
    } else if (optimalRev > 0) {
      revenueUplift = 100;
    }

    let recommendation = `Optimal tier ~$${optimalFloor.toFixed(2)} CPM maximizes modeled revenue for this sample.`;
    if (optimalFloor < currentFloor) {
      recommendation = `Lowering floor toward $${optimalFloor.toFixed(2)} may improve revenue per 1000 auctions in this model.`;
    } else if (optimalFloor > currentFloor) {
      recommendation = `Raising floor toward $${optimalFloor.toFixed(2)} may improve revenue per 1000 auctions if demand holds.`;
    }

    analyses.push({
      adUnitId: u.id,
      adUnitName: u.name,
      currentFloor,
      currentFillRate,
      currentRevenuePer1000,
      optimalFloor,
      optimalFillRate: optimalFill,
      optimalRevenuePer1000: optimalRev,
      revenueUplift,
      tiers,
      recommendation
    });
  }

  return json({ eligible: true, units: analyses });
}

function rowsPassFloor(
  rows: Array<{ winning_bid: string | null; winning_campaign_id: string | null }>,
  floor: number
): number {
  return rows.filter(
    (r) =>
      r.winning_campaign_id != null &&
      r.winning_bid != null &&
      Number(r.winning_bid) > 0 &&
      Number(r.winning_bid) >= floor
  ).length;
}
