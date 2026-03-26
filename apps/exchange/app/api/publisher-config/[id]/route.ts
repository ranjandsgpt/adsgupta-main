import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge"; // fast, globally cached

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
    "Content-Type": "application/json"
  };

  try {
    const sql = getDb();
    const publisherId = params.id;

    // Load publisher
    const pub = (await sql`
      SELECT id, domain, status, auction_type, features, freq_cap_day
      FROM publishers WHERE id = ${publisherId} AND status = 'active' LIMIT 1
    `) as any[];
    if (!pub.length) {
      return Response.json({ error: "Publisher not found or inactive" }, { status: 404, headers: CORS });
    }

    // Load active ad units
    const units = (await sql`
      SELECT id, name, sizes, floor_price, ad_type, environment, auction_type
      FROM ad_units WHERE publisher_id = ${publisherId} AND status = 'active'
      ORDER BY created_at ASC
    `) as any[];

    // Load floor rules applicable to this publisher
    const floorRules = (await sql`
      SELECT name, floor_cpm, applies_to_sizes, applies_to_env, applies_to_geos, applies_to_devices, priority
      FROM pricing_rules WHERE active = true
      ORDER BY priority DESC LIMIT 20
    `) as any[];

    // Load Prebid configs for this publisher
    const prebidConfigs = (await sql`
      SELECT adapter_id, params, timeout_ms, status
      FROM publisher_prebid_configs
      WHERE publisher_id = ${publisherId} AND status = 'active'
    `) as any[];

    const config = {
      publisherId,
      domain: pub[0].domain,
      auctionType: pub[0].auction_type || "first_price",
      adUnits: units.map((u: any) => ({
        id: u.id,
        name: u.name,
        sizes: u.sizes || ["300x250"],
        floor: Number(u.floor_price) || 0.01,
        type: u.ad_type || "banner",
        env: u.environment || "display"
      })),
      prebid: {
        enabled: prebidConfigs.length > 0,
        adapters: prebidConfigs.map((p: any) => ({
          adapter: p.adapter_id,
          params: p.params,
          timeout: p.timeout_ms || 1000
        }))
      },
      features: {
        lazyLoad: pub[0].features?.lazyLoad ?? true,
        viewabilityThreshold: pub[0].features?.viewabilityThreshold ?? 50,
        frequencyCapDay: pub[0].freq_cap_day || 0,
        signalCollection: true,
        audiencePixels: pub[0].features?.audiencePixels || [],
        adRefresh: pub[0].features?.adRefresh ?? false,
        adRefreshSeconds: pub[0].features?.adRefreshSeconds ?? 30,
        interscroller: pub[0].features?.interscroller ?? false,
        interstitial: pub[0].features?.interstitial ?? false,
        rewarded: pub[0].features?.rewarded ?? false,
        sticky: pub[0].features?.sticky ?? false
      },
      floorRules: floorRules.map((r: any) => ({
        name: r.name,
        floor: Number(r.floor_cpm),
        sizes: r.applies_to_sizes,
        env: r.applies_to_env,
        geos: r.applies_to_geos,
        devices: r.applies_to_devices,
        priority: r.priority
      })),
      version: new Date().toISOString().split("T")[0],
      generatedAt: new Date().toISOString()
    };

    return Response.json(config, { headers: CORS });
  } catch (e) {
    console.error("[publisher-config]", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

