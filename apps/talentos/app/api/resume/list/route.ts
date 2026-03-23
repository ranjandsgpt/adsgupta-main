import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const resumes = await prisma.resume.findMany({
      where: { userId: user.user_id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        version: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ resumes });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
