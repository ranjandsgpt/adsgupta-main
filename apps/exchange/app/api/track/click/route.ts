export const dynamic = "force-dynamic";
import { isClickFraud } from "@/lib/ivt-detector";
import { sql } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

/** `id` = impression UUID; `url` = encoded destination. */
export async function GET(request: NextRequest) {
  const impressionId = request.nextUrl.searchParams.get("id");
  const urlRaw = request.nextUrl.searchParams.get("url");

  let destination = "https://adsgupta.com";
  if (urlRaw != null && urlRaw !== "") {
    try {
      destination = decodeURIComponent(urlRaw);
    } catch {
      destination = urlRaw;
    }
  }

  if (!impressionId) {
    return NextResponse.redirect(destination, 302);
  }

  try {
    const ip = getClientIp(request);
    if (isClickFraud(ip)) {
      return NextResponse.redirect(destination, 302);
    }
    const imp = await sql<{ id: string; campaign_id: string | null }>`
      SELECT id, campaign_id FROM impressions WHERE id = ${impressionId} LIMIT 1
    `;
    const row = imp.rows[0];
    if (row) {
      await sql`
        INSERT INTO clicks (impression_id, campaign_id, click_url)
        VALUES (${row.id}, ${row.campaign_id}, ${destination})
      `;
    }
  } catch (e) {
    console.error("[click]", e);
  }

  return NextResponse.redirect(destination, 302);
}
