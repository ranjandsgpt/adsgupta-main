export const dynamic = "force-dynamic";
import { getDemandAnalytics, parseRangeParams } from "@/lib/analytics-queries";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const emailRaw = request.nextUrl.searchParams.get("email")?.trim() ?? "";
  if (!emailRaw) return NextResponse.json({ error: "email required" }, { status: 400 });

  if (auth.role === "demand") {
    const allowed = (auth.demandAdvertiser ?? "").toLowerCase() === emailRaw.toLowerCase();
    if (!allowed) return forbidden();
  } else if (auth.role !== "admin") {
    return forbidden();
  }

  const sp = request.nextUrl.searchParams;
  const dr = parseRangeParams({
    range: sp.get("range"),
    from: sp.get("from"),
    to: sp.get("to")
  });

  try {
    const data = await getDemandAnalytics(emailRaw, dr.fromStr, dr.toStr);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[demand-analytics]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
