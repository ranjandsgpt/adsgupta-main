export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { validateEmail } from "@/lib/validate";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = (await request.json()) as { ids?: string[]; status?: string; advertiser_email?: string };
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string") : [];
  const st = body.status;
  if (!ids.length || !st || !["active", "paused", "pending"].includes(st)) {
    return json({ error: "ids and valid status required" }, 400);
  }

  if (!auth) {
    const em = String(body.advertiser_email ?? "").trim().toLowerCase();
    if (!em || !validateEmail(em)) return unauthorized();
    let updated = 0;
    for (const id of ids) {
      const row =
        await sql`SELECT advertiser_email, contact_email FROM campaigns WHERE id = ${id} LIMIT 1`;
      const c = row.rows[0] as { advertiser_email?: string; contact_email?: string } | undefined;
      if (!c) continue;
      const cem = String(c.advertiser_email ?? c.contact_email ?? "").trim().toLowerCase();
      if (cem !== em) continue;
      await sql`UPDATE campaigns SET status = ${st} WHERE id = ${id}`;
      updated++;
    }
    cacheDelete("campaigns:active");
    return json({ updated });
  }

  if (auth.role === "publisher") return forbidden();
  if (auth.role !== "demand" && auth.role !== "admin") return forbidden();

  const adv = demandAdvertiserFilter(auth);

  let updated = 0;
  for (const id of ids) {
    const row = await sql`SELECT advertiser_name, advertiser FROM campaigns WHERE id = ${id} LIMIT 1`;
    const c = row.rows[0] as { advertiser_name?: string; advertiser?: string } | undefined;
    if (!c) continue;
    const name = String(c.advertiser_name ?? c.advertiser ?? "");
    if (adv && name !== adv) continue;
    await sql`UPDATE campaigns SET status = ${st} WHERE id = ${id}`;
    updated++;
  }

  cacheDelete("campaigns:active");
  return json({ updated });
}
