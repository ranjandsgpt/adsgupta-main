import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { analyzeResume } from "@/lib/resume-intelligence";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const formData = await request.formData();
    const file = formData.get("resume");
    const version = formData.get("version");

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "resume file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await parseResumeBuffer(buffer, file.type, file.name);
    if (!rawText.trim()) {
      return NextResponse.json({ detail: "Could not parse resume text" }, { status: 400 });
    }

    const intel = await analyzeResume(rawText);
    const resume = await prisma.resume.create({
      data: {
        userId: user.user_id,
        fileName: file.name,
        rawText,
        version: typeof version === "string" && version.trim() ? version.trim() : "default",
        skills: intel.skills,
        experience: intel.experience,
        education: intel.education,
      },
    });

    return NextResponse.json({
      id: resume.id,
      fileName: resume.fileName,
      version: resume.version,
      createdAt: resume.createdAt,
      resume: intel,
    });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
