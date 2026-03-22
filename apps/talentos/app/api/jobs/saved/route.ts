import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

/** List saved jobs — was GET /api/jobs/saved/:user_id in FastAPI */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ detail: "user_id query required" }, { status: 400 });
  }
  try {
    const db = await getDb();
    const jobs = await db
      .collection("saved_jobs")
      .find({ user_id: userId }, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json({ jobs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
