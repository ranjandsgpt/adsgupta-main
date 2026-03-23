import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
      include: { resume: { select: { fileName: true, id: true } } },
    });
    if (!analysis) {
      return NextResponse.json({ detail: "Analysis not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: analysis.id,
      roleName: analysis.roleName,
      companyName: analysis.companyName ?? "Target Company",
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      interviewQuestions: analysis.interviewQuestions,
      summary: analysis.summary,
      jobDescription: analysis.jobDescription,
      createdAt: analysis.createdAt,
      resume: analysis.resume,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
