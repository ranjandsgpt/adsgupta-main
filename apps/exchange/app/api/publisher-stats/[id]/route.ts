import { computeExchangeStats } from "@/lib/stats-queries";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await computeExchangeStats(params.id);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[publisher-stats]", e);
    return NextResponse.json({ error: "Failed to load publisher stats" }, { status: 500 });
  }
}
