export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/** `id` = impression id (optional); `url` = destination. */
export async function GET(request: NextRequest) {
  const impressionId = request.nextUrl.searchParams.get("id");
  const urlLegacy = request.nextUrl.searchParams.get("url");
  const destParam = request.nextUrl.searchParams.get("dest");
  const destinationRaw = urlLegacy ?? destParam ?? "https://adsgupta.com";

  let destination: string;
  try {
    destination = decodeURIComponent(destinationRaw);
  } catch {
    destination = destinationRaw;
  }

  const campaignId = request.nextUrl.searchParams.get("campaignId");

  try {
    await sql`
      INSERT INTO clicks (impression_id, campaign_id, click_url)
      VALUES (${impressionId}, ${campaignId}, ${destination})
    `;
  } catch (e) {
    console.error("[click]", e);
  }

  return NextResponse.redirect(destination, 302);
}
