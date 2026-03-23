import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePrepGuide } from "@/lib/prep-guide";
import { getCompanyIntel } from "@/lib/company-intelligence";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { checkCredits } from "@/lib/credits";
import type { NextRequest } from "next/server";

const TTL_DAYS = 7;

async function ensureCacheTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS prep_guide_cache (
      analysis_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    let userId = "";
    try {
      const user = await getCurrentUserFromRequest(request);
      userId = user.user_id;
    } catch {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: "Prep guides require TalentOS Pro." },
        { status: 403 }
      );
    }
    const creditCheck = await checkCredits(userId, "prep_guide");
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: creditCheck.message },
        { status: 403 }
      );
    }

    await ensureCacheTable();
    const analysisId = params.analysisId;

    const cached = (await prisma.$queryRawUnsafe(
      `SELECT payload, created_at FROM prep_guide_cache WHERE analysis_id = $1 LIMIT 1`,
      analysisId
    )) as Array<{ payload: unknown; created_at: Date }>;
    if (cached[0]) {
      const ageMs = Date.now() - new Date(cached[0].created_at).getTime();
      if (ageMs < TTL_DAYS * 24 * 60 * 60 * 1000) {
        return NextResponse.json({ payload: cached[0].payload, cached: true });
      }
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true },
    });
    if (!analysis) {
      return NextResponse.json({ detail: "Analysis not found" }, { status: 404 });
    }

    const companyIntel = await getCompanyIntel(analysis.companyName ?? "Target Company");
    const resumeSkills = analysis.resume.skills as { technical?: string[]; soft?: string[]; tools?: string[] } | null;
    const prepGuide = await generatePrepGuide(
      {
        roleName: analysis.roleName,
        matchScore: analysis.matchScore,
        strengths: Array.isArray(analysis.strengths) ? (analysis.strengths as string[]) : [],
        gaps: Array.isArray(analysis.gaps) ? (analysis.gaps as string[]) : [],
      },
      companyIntel,
      {
        name: analysis.resume.fileName.replace(/\.(pdf|docx)$/i, ""),
        currentRole: analysis.roleName,
        experienceYears: 0,
        experience: analysis.resume.experience,
      }
    );

    const payload = {
      analysisId,
      companyIntel,
      prepGuide,
      roleName: analysis.roleName,
      companyName: analysis.companyName ?? "Target Company",
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      resumeSkills: resumeSkills ?? null,
    };

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO prep_guide_cache (analysis_id, payload, created_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (analysis_id)
      DO UPDATE SET payload = EXCLUDED.payload, created_at = NOW()
      `,
      analysisId,
      JSON.stringify(payload)
    );

    return NextResponse.json({ payload, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Failed to generate prep guide" }, { status: 500 });
  }
}
