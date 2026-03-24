import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { generateLLMResponse } from "@/lib/llm";

type NaukriProfile = {
  profileSummary: string;
  keySkills: string[];
  careerObjective: string;
  noticePeriodSuggestion: string;
  expectedSalaryTalkingPoints: string[];
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON from LLM");
  return JSON.parse(match[0]) as T;
}

function fallbackProfile(): NaukriProfile {
  return {
    profileSummary: "AI profile generation is temporarily unavailable. Please try again in a moment.",
    keySkills: ["Communication", "Problem Solving"],
    careerObjective: "Leverage my experience to drive measurable business outcomes in a growth-focused role.",
    noticePeriodSuggestion: "Based on your current role and market norms, mention your actual notice period transparently.",
    expectedSalaryTalkingPoints: ["Anchor on role scope, market benchmark, and measurable impact from prior experience."],
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
        "Write a Naukri.com profile including: profile summary (500 words), key skills, career objective, notice period suggestion, expected salary talking points. Return valid JSON with keys: profileSummary, keySkills, careerObjective, noticePeriodSuggestion, expectedSalaryTalkingPoints.",
        rawText,
        true
      );
      const parsed = parseJson<NaukriProfile>(output);
      return NextResponse.json({
        profileSummary: parsed.profileSummary ?? "",
        keySkills: parsed.keySkills ?? [],
        careerObjective: parsed.careerObjective ?? "",
        noticePeriodSuggestion: parsed.noticePeriodSuggestion ?? "",
        expectedSalaryTalkingPoints: parsed.expectedSalaryTalkingPoints ?? [],
      });
    } catch (error) {
      console.error("[talentos/naukri-profile]", (error as { message?: string })?.message || error);
      return NextResponse.json({ ...fallbackProfile(), degraded: true });
    }
  } catch (error) {
    console.error("[talentos/naukri-profile]", (error as { message?: string })?.message || error);
    return NextResponse.json({ ...fallbackProfile(), degraded: true });
  }
}
