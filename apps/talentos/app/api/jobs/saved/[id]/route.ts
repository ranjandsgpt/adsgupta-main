import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const r = await prisma.savedJob.deleteMany({ where: { id: params.id, userId: user.user_id } });
    if (r.count === 0) {
      return NextResponse.json({ detail: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
