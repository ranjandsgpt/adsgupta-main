export const dynamic = "force-dynamic";
import { explainEffectiveFloor } from "@/lib/floor-engine";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

/** Admin/publisher: preview effective floor + matched rules. */
export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() ?? "";
  const adUnitId = request.nextUrl.searchParams.get("adUnitId")?.trim() ?? "";
  const sizesParam = request.nextUrl.searchParams.get("sizes")?.trim() ?? "300x250";
  const environment = request.nextUrl.searchParams.get("environment")?.trim() || "web";
  const pageUrl = request.nextUrl.searchParams.get("pageUrl")?.trim() || "";
  const country = request.nextUrl.searchParams.get("country")?.trim() || undefined;

  if (!publisherId || !adUnitId) {
    return NextResponse.json({ error: "publisherId and adUnitId required" }, { status: 400 });
  }

  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

  const sizes = sizesParam.split(",").map((s) => s.trim()).filter(Boolean);
  const adType = request.nextUrl.searchParams.get("adType")?.trim() || "display";
  const ex = await explainEffectiveFloor({
    adUnitId,
    publisherId,
    sizes: sizes.length ? sizes : ["300x250"],
    adType,
    environment,
    pageUrl,
    country
  });

  return NextResponse.json({
    ...ex,
    explanation: `Max of unit floor (${ex.unitFloor}) and highest matching rule (${ex.ruleFloors.length ? Math.max(...ex.ruleFloors.map((r) => r.floor)) : 0}) = ${ex.effective}`,
    matchedRules: ex.ruleFloors
  });
}
