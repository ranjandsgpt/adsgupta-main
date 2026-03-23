import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readinessFromScore(score: number) {
  if (score < 40) return "Not Ready";
  if (score < 55) return "Needs Work";
  if (score < 70) return "Almost There";
  if (score < 85) return "Interview Ready";
  return "Outstanding";
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUserFromRequest(request);
    const userId = sessionUser.user_id;

    const [user, analyses, interviews, savedJobs, resumes] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.analysis.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.interview.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.savedJob.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.resume.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    if (!user) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

    const totalAnalyses = analyses.length;
    const totalInterviews = interviews.length;
    const averageMatchScore = totalAnalyses
      ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / totalAnalyses)
      : 0;

    const interviewScores = interviews.map((i) => {
      const scores = i.scores as Record<string, unknown> | null;
      return asNumber(scores?.overallScore ?? scores?.total ?? 0);
    });
    const averageInterviewScore = interviewScores.length
      ? Math.round(interviewScores.reduce((s, n) => s + n, 0) / interviewScores.length)
      : 0;

    const readinessLevel = readinessFromScore(Math.round((averageMatchScore + averageInterviewScore) / 2));

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const interviewsThisWeek = interviews.filter((i) => new Date(i.createdAt).getTime() >= weekAgo).length;

    const last3 = interviewScores.slice(0, 3);
    let improvementTrend: "improving" | "stable" | "declining" = "stable";
    if (last3.length >= 2) {
      if (last3[0] > last3[last3.length - 1] + 5) improvementTrend = "improving";
      else if (last3[0] < last3[last3.length - 1] - 5) improvementTrend = "declining";
    }

    const recentActivity = [
      ...analyses.slice(0, 5).map((a) => ({
        type: "analysis",
        title: `Analysis for ${a.roleName}`,
        date: a.createdAt.toISOString(),
        score: a.matchScore,
      })),
      ...interviews.slice(0, 5).map((i) => ({
        type: "interview",
        title: `${i.persona.replaceAll("_", " ")} interview`,
        date: i.createdAt.toISOString(),
        score: asNumber((i.scores as Record<string, unknown> | null)?.overallScore ?? 0),
      })),
      ...savedJobs.slice(0, 5).map((j) => ({
        type: "job_saved",
        title: `Saved ${j.title} at ${j.company}`,
        date: j.createdAt.toISOString(),
        score: j.matchScore ?? 0,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const latestAnalysis = analyses[0];
    let upcomingPrepTopics: string[] = [];
    if (latestAnalysis) {
      const cached = (await prisma.$queryRawUnsafe(
        "SELECT payload FROM prep_guide_cache WHERE analysis_id = $1 LIMIT 1",
        latestAnalysis.id
      )) as Array<{ payload: { prepGuide?: { studyTopics?: Array<{ topic?: string }> } } }>;
      const topics = cached[0]?.payload?.prepGuide?.studyTopics ?? [];
      upcomingPrepTopics = topics.map((t) => t.topic || "").filter(Boolean).slice(0, 5);
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        currentRole: user.currentRole,
        targetRole: user.targetRole,
        isSubscribed: user.isSubscribed,
        credits: user.credits,
      },
      stats: {
        totalAnalyses,
        totalInterviews,
        averageMatchScore,
        averageInterviewScore,
        readinessLevel,
        interviewsThisWeek,
        improvementTrend,
      },
      recentActivity,
      savedJobs: savedJobs.length,
      upcomingPrepTopics,
      resumes: resumes.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        version: r.version,
        createdAt: r.createdAt.toISOString(),
      })),
      savedJobsPreview: savedJobs.slice(0, 3).map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        matchScore: j.matchScore,
      })),
    });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
