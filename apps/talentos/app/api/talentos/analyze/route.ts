import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { analyzeMatch, analyzeResume } from "@/lib/resume-intelligence";
import { getCurrentUserFromRequest } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { checkCredits, deductCredit } from "@/lib/credits";
import { GUEST_FREE_ANALYSES } from "@/lib/credits";

async function resolveUserId(request: NextRequest, formData: FormData): Promise<string | null> {
  try {
    const user = await getCurrentUserFromRequest(request);
    return user.user_id;
  } catch {
    const guestId = formData.get("userId");
    return typeof guestId === "string" && guestId.length > 0 ? guestId : null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = await resolveUserId(request, formData);
    if (!userId) {
      return NextResponse.json({ detail: "Missing userId" }, { status: 400 });
    }
    const creditCheck = await checkCredits(userId, "analysis");
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: creditCheck.message },
        { status: 403 }
      );
    }

    const jobDescription = formData.get("jobDescription");
    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json({ detail: "jobDescription is required" }, { status: 400 });
    }

    let resumeText = "";
    let resumeRecordId = "";

    const existingResumeId = formData.get("resumeId");
    if (typeof existingResumeId === "string" && existingResumeId.trim()) {
      const resume = await prisma.resume.findUnique({ where: { id: existingResumeId } });
      if (!resume || resume.userId !== userId) {
        return NextResponse.json({ detail: "Resume not found" }, { status: 404 });
      }
      resumeText = resume.rawText;
      resumeRecordId = resume.id;
    } else {
      const file = formData.get("resume");
      if (!(file instanceof File)) {
        return NextResponse.json({ detail: "Resume file is required" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      resumeText = await parseResumeBuffer(buffer, file.type, file.name);
      if (!resumeText.trim()) {
        return NextResponse.json({ detail: "Unable to extract text from resume" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user && userId.startsWith("guest_")) {
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@guest.talentos.local`,
            name: "Guest",
            passwordHash: "guest_account_no_password",
            credits: GUEST_FREE_ANALYSES,
          },
        });
      }

      const resumeData = await analyzeResume(resumeText);
      const createdResume = await prisma.resume.create({
        data: {
          userId,
          fileName: file.name,
          rawText: resumeText,
          skills: resumeData.skills,
          experience: resumeData.experience,
          education: resumeData.education,
        },
      });
      resumeRecordId = createdResume.id;
    }

    try {
      const resumeData = await analyzeResume(resumeText);
      const match = await analyzeMatch(resumeData, jobDescription);

      const analysis = await prisma.analysis.create({
        data: {
          userId,
          resumeId: resumeRecordId,
          jobDescription,
          roleName: match.roleName,
          companyName: match.companyName || "Target Company",
          matchScore: match.matchScore,
          strengths: match.strengths,
          gaps: match.gaps,
          interviewQuestions: match.interviewQuestions,
          summary: `${match.summary}\n\nPrep Advice: ${match.prepAdvice}`,
        },
      });
      await deductCredit(userId, "analysis");

      return NextResponse.json({
        id: analysis.id,
        roleName: match.roleName,
        companyName: match.companyName,
        matchScore: match.matchScore,
        strengths: match.strengths,
        gaps: match.gaps,
        interviewQuestions: match.interviewQuestions,
        summary: match.summary,
        prepAdvice: match.prepAdvice,
        resume: resumeData,
      });
    } catch (error) {
      console.error('Analysis error:', error instanceof Error ? error.message : error);
      return NextResponse.json(
        { error: "Analysis temporarily unavailable. Please try again.", matchScore: null },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Analysis error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ detail: "Analysis request failed" }, { status: 500 });
  }
}
