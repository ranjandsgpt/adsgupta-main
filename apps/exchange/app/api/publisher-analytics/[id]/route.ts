export const dynamic = "force-dynamic";
import { getPublisherScopedAnalytics, parseRangeParams } from "@/lib/analytics-queries";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const { id: publisherId } = await ctx.params;
  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

  const sp = request.nextUrl.searchParams;
  const dr = parseRangeParams({
    range: sp.get("range"),
    from: sp.get("from"),
    to: sp.get("to")
  });

  try {
    const data = await getPublisherScopedAnalytics(publisherId, dr.fromStr, dr.toStr);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[publisher-analytics]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
