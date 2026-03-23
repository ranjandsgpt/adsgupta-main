import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/** List saved jobs — was GET /api/jobs/saved/:user_id in FastAPI */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ detail: "user_id query required" }, { status: 400 });
  }
  try {
    const jobsRaw = await prisma.savedJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const jobs = jobsRaw.map((j) => ({
      job_id: j.id,
      user_id: j.userId,
      title: j.title,
      company: j.company,
      location: j.location ?? "",
      url: j.url,
      source: j.source,
      match_score: j.matchScore,
      created_at: j.createdAt.toISOString(),
    }));
    return NextResponse.json({ jobs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
