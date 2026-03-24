export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const impressionId = request.nextUrl.searchParams.get("impressionId");
  const campaignId = request.nextUrl.searchParams.get("campaignId");
  const destination = request.nextUrl.searchParams.get("dest") ?? "https://adsgupta.com";
  if (campaignId) {
    await sql`
      INSERT INTO clicks (impression_id, campaign_id, click_url)
      VALUES (${impressionId}, ${campaignId}, ${destination})
    `;
  }
  return NextResponse.redirect(destination, 302);
}
