import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ detail: "user_id query required" }, { status: 400 });
    }
    const db = await getDb();
    const r = await db.collection("saved_jobs").deleteOne({ job_id: params.jobId, user_id: userId });
    if (r.deletedCount === 0) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
