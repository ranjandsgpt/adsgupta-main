export const dynamic = "force-dynamic";
import { runAuction } from "@/lib/auction-engine";
import { NextRequest, NextResponse } from "next/server";

/** Runs the real auction engine and returns winner or error (ops only). */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adUnitId = request.nextUrl.searchParams.get("adUnitId")?.trim() ?? "";
  if (!adUnitId) {
    return NextResponse.json({ error: "adUnitId is required" }, { status: 400 });
  }

  const openrtbRequestId = `debug-${Date.now()}`;
  const imp = {
    id: "1",
    tagid: adUnitId,
    bidfloor: 0.01,
    banner: { format: [{ w: 300, h: 250 }] }
  };

  try {
    const result = await runAuction(openrtbRequestId, adUnitId, imp, "https://debug.adsgupta.com/test", 0.01, {
      site: { page: "https://debug.adsgupta.com/test", domain: "debug.adsgupta.com" },
      device: { ua: "MDE-Debug/1.0", devicetype: 2, geo: { country: "US" } },
      fullRequest: {
        id: openrtbRequestId,
        imp: [imp],
        site: { page: "https://debug.adsgupta.com/test", domain: "debug.adsgupta.com" },
        device: { ua: "MDE-Debug/1.0", devicetype: 2, geo: { country: "US" } },
        at: 1
      }
    });

    return NextResponse.json({
      ok: Boolean(result?.winner),
      auctionLogId: result?.auctionLogId ?? null,
      bidCount: result?.bidCount ?? 0,
      hasWinner: Boolean(result?.winner),
      price: result?.winner?.clearingPrice ?? null,
      admPreview: result?.winner?.adm?.slice(0, 200) ?? null
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
