export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

const DEMO_DOMAIN = "demo-serving.adsgupta.com";
const DEMO_PUBLISHER_NAME = "Demo Publisher";
const DEMO_CONTACT = "demo@adsgupta.com";
const DEMO_ADVERTISER = "demo-advertiser@adsgupta.com";
const DEMO_SIZE = "300x250";
const DEMO_BID = 5.0;
const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=250&fit=crop";
const DEMO_CLICK = "https://adsgupta.com";

/** Creates or refreshes a persistent demo publisher + campaign so at least one ad can serve. */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    let publisherId: string;
    const existingPub = await sql<{ id: string }>`
      SELECT id::text AS id FROM publishers WHERE domain = ${DEMO_DOMAIN} LIMIT 1
    `;
    if (existingPub.rows[0]?.id) {
      publisherId = existingPub.rows[0].id;
      await sql`
        UPDATE publishers
        SET status = 'active', name = ${DEMO_PUBLISHER_NAME}, contact_email = ${DEMO_CONTACT}
        WHERE id = ${publisherId}::uuid
      `;
    } else {
      const ins = await sql<{ id: string }>`
        INSERT INTO publishers (name, domain, contact_email, status, ads_txt_verified, primary_ad_formats)
        VALUES (${DEMO_PUBLISHER_NAME}, ${DEMO_DOMAIN}, ${DEMO_CONTACT}, 'active', true, ARRAY['display'])
        RETURNING id::text AS id
      `;
      publisherId = ins.rows[0]?.id ?? "";
      if (!publisherId) return json({ ok: false, error: "Failed to create demo publisher" }, 500);
    }

    let adUnitId: string;
    const existingUnit = await sql<{ id: string }>`
      SELECT id::text AS id FROM ad_units
      WHERE publisher_id = ${publisherId}::uuid AND name = 'Demo 300x250'
      LIMIT 1
    `;
    if (existingUnit.rows[0]?.id) {
      adUnitId = existingUnit.rows[0].id;
      await sql`
        UPDATE ad_units
        SET status = 'active', floor_price = 0.01, sizes = ARRAY[${DEMO_SIZE}]::text[]
        WHERE id = ${adUnitId}::uuid
      `;
    } else {
      const ins = await sql<{ id: string }>`
        INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
        VALUES (${publisherId}::uuid, 'Demo 300x250', ARRAY[${DEMO_SIZE}]::text[], 'display', 'web', 0.01, 'active')
        RETURNING id::text AS id
      `;
      adUnitId = ins.rows[0]?.id ?? "";
      if (!adUnitId) return json({ ok: false, error: "Failed to create demo ad unit" }, 500);
    }

    let campaignId: string;
    const existingCampaign = await sql<{ id: string }>`
      SELECT id::text AS id FROM campaigns
      WHERE advertiser_email = ${DEMO_ADVERTISER} AND campaign_name = 'Demo Campaign'
      LIMIT 1
    `;
    if (existingCampaign.rows[0]?.id) {
      campaignId = existingCampaign.rows[0].id;
      await sql`
        UPDATE campaigns
        SET status = 'active', bid_price = ${DEMO_BID}, daily_budget = NULL
        WHERE id = ${campaignId}::uuid
      `;
    } else {
      const ins = await sql<{ id: string }>`
        INSERT INTO campaigns (
          advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
          status, name, advertiser, contact_email, freq_cap_day, freq_cap_session
        )
        VALUES (
          'Demo Advertiser', ${DEMO_ADVERTISER}, 'Demo Campaign', ${DEMO_BID}, NULL,
          'active', 'Demo Campaign', 'Demo Advertiser', ${DEMO_ADVERTISER}, 0, 0
        )
        RETURNING id::text AS id
      `;
      campaignId = ins.rows[0]?.id ?? "";
      if (!campaignId) return json({ ok: false, error: "Failed to create demo campaign" }, 500);
    }

    const existingCreative = await sql<{ id: string }>`
      SELECT id::text AS id FROM creatives
      WHERE campaign_id = ${campaignId}::uuid AND name = 'Demo Banner'
      LIMIT 1
    `;
    if (existingCreative.rows[0]?.id) {
      await sql`
        UPDATE creatives
        SET status = 'active', scan_passed = true, image_url = ${DEMO_IMAGE}, click_url = ${DEMO_CLICK}, size = ${DEMO_SIZE}
        WHERE id = ${existingCreative.rows[0].id}::uuid
      `;
    } else {
      await sql`
        INSERT INTO creatives (campaign_id, name, type, size, image_url, click_url, status, scan_passed)
        VALUES (${campaignId}::uuid, 'Demo Banner', 'banner', ${DEMO_SIZE}, ${DEMO_IMAGE}, ${DEMO_CLICK}, 'active', true)
      `;
    }

    const origin = request.nextUrl.origin;
    const testPageUrl = `${origin}/test-ad.html?publisherId=${encodeURIComponent(publisherId)}&unitId=${encodeURIComponent(adUnitId)}&autorun=1`;

    return json({
      ok: true,
      publisherId,
      adUnitId,
      campaignId,
      domain: DEMO_DOMAIN,
      testPageUrl,
      tagSnippet: `<script async src="${origin}/mde.js"></script>
<script>
  window.mde = window.mde || { cmd: [] };
  mde.cmd.push(function() {
    mde.init({ networkCode: '${publisherId}' });
    mde.defineSlot({ unitId: '${adUnitId}', div: 'ad-slot', sizes: ['300x250'], floor: 0.01 });
    mde.enableServices();
    mde.display('ad-slot');
  });
</script>
<div id="ad-slot" style="width:300px;height:250px"></div>`
    });
  } catch (e) {
    console.error("[demo/setup]", e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
}
