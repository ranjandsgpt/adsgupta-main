export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function sizesOverlap(creativeSize: string, adUnitSizes: string[]): boolean {
  if (!creativeSize) return true;
  if (!adUnitSizes || adUnitSizes.length === 0) return true;
  const cs = creativeSize.toLowerCase();
  return adUnitSizes.some((s) => String(s).toLowerCase() === cs);
}

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret") ?? "";
    if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adUnitId = request.nextUrl.searchParams.get("adUnitId")?.trim() ?? "";
    if (!adUnitId) return NextResponse.json({ error: "adUnitId is required" }, { status: 400 });

    const unitRes = await sql<{
      id: string;
      publisher_id: string;
      sizes: string[];
      floor_price: string;
      status: string;
      name: string;
    }>`
      SELECT id, publisher_id, sizes, floor_price::text AS floor_price, status, name
      FROM ad_units
      WHERE id = ${adUnitId}
      LIMIT 1
    `;
    const adUnit = unitRes.rows[0] ?? null;
    if (!adUnit) return NextResponse.json({ error: "Ad unit not found" }, { status: 404 });

    const pubRes = await sql<{ id: string; status: string }>`
      SELECT id, status FROM publishers WHERE id = ${adUnit.publisher_id} LIMIT 1
    `;
    const publisher = pubRes.rows[0] ?? null;
    if (!publisher) return NextResponse.json({ error: "Publisher not found" }, { status: 404 });

    const campsRes = await sql<{
      id: string;
      bid_price: string;
      daily_budget: string | null;
      start_date: string | null;
      end_date: string | null;
      target_sizes: string[] | null;
      status: string;
    }>`
      SELECT id, bid_price::text AS bid_price, daily_budget::text AS daily_budget,
        start_date::text AS start_date, end_date::text AS end_date,
        target_sizes, status
      FROM campaigns
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;
    const campaignsFound = campsRes.rows.length;

    const today = new Date().toISOString().slice(0, 10);
    const inDate = campsRes.rows.filter((c) => {
      const s = c.start_date ? String(c.start_date).slice(0, 10) : null;
      const e = c.end_date ? String(c.end_date).slice(0, 10) : null;
      if (s && today < s) return false;
      if (e && today > e) return false;
      return true;
    });
    const campaignsAfterDateFilter = inDate.length;

    const spendRes = await sql<{ campaign_id: string; spend: string }>`
      SELECT campaign_id::text AS campaign_id, (COALESCE(SUM(winning_bid), 0) / 1000)::text AS spend
      FROM impressions
      WHERE created_at::date = CURRENT_DATE
      GROUP BY 1
    `;
    const spendMap = new Map(spendRes.rows.map((r) => [r.campaign_id, Number(r.spend ?? 0)]));

    const afterBudget = inDate.filter((c) => {
      const daily = c.daily_budget != null ? Number(c.daily_budget) : 0;
      if (!Number.isFinite(daily) || daily <= 0) return true; // unlimited
      const spend = spendMap.get(c.id) ?? 0;
      return spend < daily;
    });
    const campaignsAfterBudgetFilter = afterBudget.length;

    const campIds = afterBudget.map((c) => c.id);
    const creativesRes =
      campIds.length === 0
        ? { rows: [] as Array<{ id: string; campaign_id: string; size: string; scan_passed: boolean | null; status: string; image_url: string | null; click_url: string | null }> }
        : await sql<{
            id: string;
            campaign_id: string;
            size: string;
            scan_passed: boolean | null;
            status: string;
            image_url: string | null;
            click_url: string | null;
          }>`
            SELECT id, campaign_id::text AS campaign_id, size, scan_passed, status, image_url, click_url
            FROM creatives
            WHERE campaign_id = ANY(${campIds}) AND status = 'active'
            ORDER BY created_at DESC
          `;

    const creativesByCampaign = new Map<string, typeof creativesRes.rows>();
    for (const cr of creativesRes.rows) {
      const list = creativesByCampaign.get(cr.campaign_id) ?? [];
      list.push(cr);
      creativesByCampaign.set(cr.campaign_id, list);
    }

    const bidsBeforeSizeFilter = creativesRes.rows.length;

    const floor = Number(adUnit.floor_price ?? 0);
    const eligible: Array<{ campaignId: string; bid: number; creative: (typeof creativesRes.rows)[number] }> = [];

    for (const c of afterBudget) {
      const bid = Number(c.bid_price);
      if (!Number.isFinite(bid) || bid <= 0) continue;
      const ts = c.target_sizes;
      const hasTargetSizes = ts && ts.length > 0 && !(ts.length === 1 && String(ts[0]) === "");
      if (hasTargetSizes) {
        const ok = (adUnit.sizes ?? []).some((s) => (ts as string[]).includes(s));
        if (!ok) continue;
      }
      const crs = creativesByCampaign.get(c.id) ?? [];
      for (const cr of crs) {
        if (cr.scan_passed === false) continue;
        if (!sizesOverlap(cr.size, adUnit.sizes ?? [])) continue;
        eligible.push({ campaignId: c.id, bid, creative: cr });
      }
    }

    const bidsAfterSizeFilter = eligible.length;
    const aboveFloor = eligible.filter((b) => b.bid >= floor);
    const bidsAboveFloor = aboveFloor.length;

    const winnerPick = aboveFloor.sort((a, b) => b.bid - a.bid)[0] ?? null;
    const winner = winnerPick
      ? {
          campaignId: winnerPick.campaignId,
          bid: winnerPick.bid,
          adm: winnerPick.creative.image_url
            ? `<a href="${winnerPick.creative.click_url ?? "#"}" target="_blank" rel="noreferrer"><img src="${winnerPick.creative.image_url}" style="width:100%;height:auto;display:block" /></a>`
            : null
        }
      : null;

    let noFillReason: string | null = null;
    if (!winner) {
      if (String(publisher.status).toLowerCase() !== "active") noFillReason = "publisher_not_active";
      else if (String(adUnit.status).toLowerCase() !== "active") noFillReason = "ad_unit_not_active";
      else if (campaignsFound === 0) noFillReason = "no_active_campaigns";
      else if (bidsBeforeSizeFilter === 0) noFillReason = "no_active_creatives";
      else if (bidsAfterSizeFilter === 0) noFillReason = "all_bids_filtered_by_size_or_targeting";
      else if (bidsAboveFloor === 0) noFillReason = "all_bids_below_floor";
      else noFillReason = "unknown";
    }

    return NextResponse.json({
      adUnit: {
        id: adUnit.id,
        sizes: adUnit.sizes,
        floor_price: adUnit.floor_price,
        status: adUnit.status
      },
      publisher,
      campaignsFound,
      campaignsAfterDateFilter,
      campaignsAfterBudgetFilter,
      bidsBeforeSizeFilter,
      bidsAfterSizeFilter,
      bidsAboveFloor,
      winner,
      noFillReason
    });
  } catch (e) {
    console.error("[api/debug/auction]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

