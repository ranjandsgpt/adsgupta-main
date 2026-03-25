export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

const BASE = "https://exchange.adsgupta.com";

/**
 * Ready-to-use Prebid.js configuration JSON for publisher + ad unit.
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() ?? "";
  const unitId = request.nextUrl.searchParams.get("unitId")?.trim() ?? "";

  if (!publisherId || !unitId) {
    return NextResponse.json({ error: "publisherId and unitId are required" }, { status: 400 });
  }

  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

  const row = await sql<{
    id: string;
    name: string;
    sizes: string[];
    floor_price: string;
    publisher_id: string;
  }>`
    SELECT id, name, sizes, floor_price::text, publisher_id
    FROM ad_units
    WHERE id = ${unitId} AND publisher_id = ${publisherId} AND status = 'active'
    LIMIT 1
  `;

  const unit = row.rows[0];
  if (!unit) {
    return NextResponse.json({ error: "Ad unit not found for publisher" }, { status: 404 });
  }

  const divId = `mde-${unit.id.replace(/-/g, "")}`;
  const sizes = (unit.sizes ?? ["300x250"]).map((s) => {
    const [w, h] = s.split("x");
    return [Number(w) || 300, Number(h) || 250];
  });
  const floor = Number(unit.floor_price ?? 0.5);

  const config = {
    bidderCode: "mde",
    openrtbEndpoint: `${BASE}/api/openrtb/auction`,
    bidderTimeout: 1200,
    priceGranularity: { buckets: [{ min: 0, max: 20, increment: 0.01 }] },
    consentMode: "iab",
    s2sConfig: { enabled: false },
    adUnits: [
      {
        code: divId,
        mediaTypes: { banner: { sizes } },
        bids: [{ bidder: "mde", params: { networkCode: publisherId, unitId: unit.id, floor } }]
      }
    ],
    mdeAdapterUrl: `${BASE}/mde-prebid.js`,
    loadOrder: [
      "1. Load prebid.js from your CDN (e.g. jsdelivr unpkg)",
      `2. <script async src="${BASE}/mde-prebid.js"></script>`,
      "3. pbjs.que.push(() => { pbjs.addAdUnits(prebidConfig.adUnits); pbjs.requestBids({ bidsBackHandler: sendAdserverRequest }); });"
    ],
    installSnippet: {
      prebidAdapter: `<script async src="${BASE}/mde-prebid.js"></script>`,
      slot: `<div id="${divId}" style="min-width:${sizes[0][0]}px;min-height:${sizes[0][1]}px"></div>`
    },
    examplePbjsInit: `var adUnits = ${JSON.stringify(
      [
        {
          code: divId,
          mediaTypes: { banner: { sizes } },
          bids: [{ bidder: "mde", params: { networkCode: publisherId, unitId: unit.id, floor } }]
        }
      ],
      null,
      2
    )};
pbjs.que.push(function() {
  pbjs.addAdUnits(adUnits);
  pbjs.requestBids({ bidsBackHandler: function() { pbjs.setTargetingForGPTAsync(); /* or your ad server */ } });
});`
  };

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while=revalidate=300"
    }
  });
}
