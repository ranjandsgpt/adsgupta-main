import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/jobs-service";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "10");
    const jobs = await getRecommendations(params.userId, limit);
    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
