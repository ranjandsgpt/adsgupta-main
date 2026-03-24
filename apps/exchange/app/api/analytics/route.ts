export const dynamic = "force-dynamic";
import { getAdminAnalytics, parseRangeParams } from "@/lib/analytics-queries";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const sp = request.nextUrl.searchParams;
  const dr = parseRangeParams({
    range: sp.get("range"),
    from: sp.get("from"),
    to: sp.get("to")
  });

  try {
    const data = await getAdminAnalytics({
      fromStr: dr.fromStr,
      toStr: dr.toStr,
      publisherId: sp.get("publisherId") ?? sp.get("publisher_id"),
      campaignId: sp.get("campaignId") ?? sp.get("campaign_id")
    });
    return NextResponse.json(data);
  } catch (e) {
    console.error("[analytics]", e);
    return NextResponse.json({ error: "Analytics query failed" }, { status: 500 });
  }
}
