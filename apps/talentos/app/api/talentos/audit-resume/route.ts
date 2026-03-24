import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { generateLLMResponse } from "@/lib/llm";

type AuditResult = {
  overallScore: number;
  atsScore: number;
  sections: Array<{ name: string; score: number; feedback: string }>;
  topIssues: string[];
  quickWins: string[];
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON from LLM");
  return JSON.parse(match[0]) as T;
}

function fallbackAudit(): AuditResult {
  return {
    overallScore: 72,
    atsScore: 70,
    sections: [
      {
        name: "Overall Resume",
        score: 72,
        feedback: "Resume uploaded successfully — AI analysis temporarily unavailable. Please try again in a moment.",
      },
    ],
    topIssues: ["Detailed AI audit is temporarily unavailable."],
    quickWins: ["Retry in a minute for full section-by-section recommendations."],
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "Resume file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await parseResumeBuffer(buffer, file.type, file.name);
    if (!rawText.trim()) {
      return NextResponse.json({ detail: "Unable to extract resume text" }, { status: 400 });
    }

    try {
      const output = await generateLLMResponse(
        "Audit this resume. Return JSON with: overallScore (0-100), atsScore (0-100), sections: [{name, score, feedback}], topIssues: string[], quickWins: string[]",
        rawText,
        true
      );
      const parsed = parseJson<AuditResult>(output);
      return NextResponse.json({
        overallScore: Number(parsed.overallScore ?? 72),
        atsScore: Number(parsed.atsScore ?? 70),
        sections: parsed.sections ?? [],
        topIssues: parsed.topIssues ?? [],
        quickWins: parsed.quickWins ?? [],
      });
    } catch (error) {
      console.error("[talentos/audit-resume]", (error as { message?: string })?.message || error);
      return NextResponse.json({ ...fallbackAudit(), degraded: true });
    }
  } catch (error) {
    console.error("[talentos/audit-resume]", (error as { message?: string })?.message || error);
    return NextResponse.json({ ...fallbackAudit(), degraded: true });
  }
}
