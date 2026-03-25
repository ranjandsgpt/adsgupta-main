export const dynamic = "force-dynamic";
import { explainEffectiveFloor } from "@/lib/floor-engine";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://exchange.adsgupta.com";

/**
 * Prebid.js configuration JSON: real ad units, floors, and publisher adapter configs from DB.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();

    const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() ?? "";
    const unitId = request.nextUrl.searchParams.get("unitId")?.trim() ?? "";

    if (!publisherId) {
      return NextResponse.json({ error: "publisherId is required" }, { status: 400 });
    }

    if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
    if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

    const unitsRes = await sql<{
      id: string;
      name: string;
      sizes: string[];
      floor_price: string;
      environment: string;
      ad_type: string;
    }>`
      SELECT id, name, sizes, floor_price::text, environment, ad_type
      FROM ad_units
      WHERE publisher_id = ${publisherId} AND status = 'active'
      ORDER BY name ASC
    `;

    let adapters: Array<{
      adapter_id: string;
      params: Record<string, unknown>;
      timeout_ms: number;
      status: string;
    }> = [];
    try {
      const ad = await sql<{
        adapter_id: string;
        params: Record<string, unknown>;
        timeout_ms: string;
        status: string;
      }>`
        SELECT adapter_id, params, timeout_ms::text, status
        FROM publisher_prebid_configs
        WHERE publisher_id = ${publisherId} AND status = 'active'
      `;
      adapters = ad.rows.map((r) => ({
        adapter_id: r.adapter_id,
        params: r.params ?? {},
        timeout_ms: Number(r.timeout_ms) || 1000,
        status: r.status
      }));
    } catch {
      adapters = [];
    }

    let pricingRules: Array<{ name: string; floor_cpm: number; priority: number }> = [];
    try {
      const pr = await sql<{ name: string; floor_cpm: string; priority: string }>`
        SELECT name, floor_cpm::text, COALESCE(priority, 0)::text AS priority
        FROM pricing_rules WHERE active = true ORDER BY priority DESC
      `;
      pricingRules = pr.rows.map((r) => ({
        name: r.name,
        floor_cpm: Number(r.floor_cpm),
        priority: Number(r.priority)
      }));
    } catch {
      pricingRules = [];
    }

    const unitsOut = [] as Array<Record<string, unknown>>;
    for (const unit of unitsRes.rows) {
      if (unitId && unit.id !== unitId) continue;
      const formatSizes = (unit.sizes ?? ["300x250"]).map((s) => {
        const [w, h] = s.split("x");
        return `${Number(w) || 300}x${Number(h) || 250}`;
      });
      const floorExpl = await explainEffectiveFloor({
        adUnitId: unit.id,
        publisherId,
        sizes: formatSizes,
        adType: unit.ad_type ?? "display",
        environment: unit.environment ?? "web",
        pageUrl: ""
      });
      const sizes = formatSizes.map((s) => {
        const [w, h] = s.split("x");
        return [Number(w) || 300, Number(h) || 250];
      });
      const divId = `mde-${unit.id.replace(/-/g, "")}`;
      unitsOut.push({
        unitId: unit.id,
        code: divId,
        name: unit.name,
        mediaTypes: { banner: { sizes } },
        floor: floorExpl.effective,
        unitBaseFloor: floorExpl.unitFloor,
        ruleFloors: floorExpl.ruleFloors,
        bids: [
          { bidder: "mde", params: { networkCode: publisherId, unitId: unit.id, floor: floorExpl.effective } },
          ...adapters.map((a) => ({ bidder: a.adapter_id, params: a.params, timeout: a.timeout_ms }))
        ]
      });
    }

    if (unitsOut.length === 0) {
      return NextResponse.json({ error: "No active ad units for publisher" }, { status: 404 });
    }

    const config = {
      bidderCode: "mde",
      openrtbEndpoint: `${BASE}/api/openrtb/auction`,
      bidderTimeout: 1200,
      priceGranularity: { buckets: [{ min: 0, max: 20, increment: 0.01 }] },
      consentMode: "iab",
      s2sConfig: { enabled: false },
      pricingRules,
      externalAdapters: adapters,
      adUnits: unitsOut,
      mdeAdapterUrl: `${BASE}/mde-prebid.js`,
      loadOrder: [
        "1. Load prebid.js from your CDN",
        `2. <script async src="${BASE}/public/mde.js"></script> or mde-prebid wrapper`,
        "3. pbjs.addAdUnits(prebidConfig.adUnits); pbjs.requestBids({ bidsBackHandler: ... });"
      ]
    };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while=revalidate=300"
      }
    });
  } catch (e) {
    console.error("[api/prebid/config GET]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
