import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  version: z.string().min(1),
});

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const deleted = await prisma.resume.deleteMany({
      where: { id: params.id, userId: user.user_id },
    });
    if (!deleted.count) {
      return NextResponse.json({ detail: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }

    const updated = await prisma.resume.updateMany({
      where: { id: params.id, userId: user.user_id },
      data: { version: parsed.data.version.trim() },
    });
    if (!updated.count) {
      return NextResponse.json({ detail: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
