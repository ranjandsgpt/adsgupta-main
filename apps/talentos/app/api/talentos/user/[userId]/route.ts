import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    await prisma.$transaction([
      prisma.interview.deleteMany({ where: { userId } }),
      prisma.analysis.deleteMany({ where: { userId } }),
      prisma.resume.deleteMany({ where: { userId } }),
      prisma.savedJob.deleteMany({ where: { userId } }),
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.user.deleteMany({ where: { id: userId } }),
    ]);
    return NextResponse.json({ success: true, userId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
