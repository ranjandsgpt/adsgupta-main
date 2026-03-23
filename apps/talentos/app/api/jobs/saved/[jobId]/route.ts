import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ detail: "user_id query required" }, { status: 400 });
    }
    const r = await prisma.savedJob.deleteMany({ where: { id: params.jobId, userId } });
    if (r.count === 0) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
