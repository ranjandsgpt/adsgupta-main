import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty") ?? "all";
    const category = params.category ?? "all";
    const latest = await prisma.analysis.findFirst({ orderBy: { createdAt: "desc" } });
    const questions = Array.isArray(latest?.interviewQuestions) ? latest?.interviewQuestions : [];
    const filtered = questions.filter((q) => {
      const item = q as { category?: string; difficulty?: string };
      const okCategory = category === "all" || (item.category || "").toLowerCase() === category.toLowerCase();
      const okDifficulty = difficulty === "all" || (item.difficulty || "").toLowerCase() === difficulty.toLowerCase();
      return okCategory && okDifficulty;
    });
    return NextResponse.json({ questions: filtered });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Unable to fetch questions" }, { status: 500 });
  }
}
