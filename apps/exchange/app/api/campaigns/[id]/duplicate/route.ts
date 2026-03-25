export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json().catch(() => ({}));

  const old = await sql`SELECT * FROM campaigns WHERE id = ${params.id} LIMIT 1`;
  const c = old.rows[0] as Record<string, unknown> | undefined;
  if (!c) return json({ error: "Not found" }, 404);

  const campEm = String(c.advertiser_email ?? c.contact_email ?? "")
    .trim()
    .toLowerCase();

  if (!auth) {
    const em = String(body.advertiser_email ?? "").trim().toLowerCase();
    if (!em || em !== campEm) return unauthorized();
  } else if (auth.role === "publisher") {
    return forbidden();
  } else if (auth.role === "demand") {
    const adv = demandAdvertiserFilter(auth);
    const name = String(c.advertiser_name ?? c.advertiser ?? "");
    if (adv && name !== adv) return forbidden();
  } else if (auth.role !== "admin") {
    return forbidden();
  }

  const cn = String(c.campaign_name ?? c.name ?? "Campaign");
  const ins = await sql`
    INSERT INTO campaigns (
      advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
      target_sizes, target_geos, target_devices, target_environments, target_domains,
      start_date, end_date, status, name, advertiser, contact_email,
      freq_cap_day, freq_cap_session, ab_test_active
    )
    SELECT
      advertiser_name, advertiser_email,
      ${`Copy of ${cn}`},
      bid_price, daily_budget,
      target_sizes, target_geos, target_devices, target_environments, target_domains,
      start_date, end_date,
      'draft',
      ${`Copy of ${cn}`}, advertiser, contact_email,
      freq_cap_day, freq_cap_session, false
    FROM campaigns WHERE id = ${params.id}
    RETURNING *
  `;
  const newCamp = ins.rows[0] as { id: string };
  const newId = newCamp.id;

  const crs = await sql`SELECT * FROM creatives WHERE campaign_id = ${params.id}`;
  for (const cr of crs.rows as Record<string, unknown>[]) {
    await sql`
      INSERT INTO creatives (campaign_id, name, type, size, image_url, click_url, status, ab_group, ab_weight)
      VALUES (
        ${newId},
        ${String(cr.name)},
        ${String(cr.type ?? "banner")},
        ${String(cr.size)},
        ${cr.image_url},
        ${cr.click_url},
        'active',
        ${String(cr.ab_group ?? "a")},
        ${Number(cr.ab_weight ?? 50)}
      )
    `;
  }

  cacheDelete("campaigns:active");
  return json({ id: newId, campaign: ins.rows[0] });
}
