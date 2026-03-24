import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { generateLLMResponse } from "@/lib/llm";

type LinkedInProfile = {
  headline: string;
  about: string;
  experienceBullets: string[];
  skills: string[];
  featuredIdeas: string[];
};

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON from LLM");
  return JSON.parse(match[0]) as T;
}

function fallbackProfile(): LinkedInProfile {
  return {
    headline: "Resume uploaded successfully | AI profile generation temporarily unavailable",
    about: "AI profile generation is temporarily unavailable. Please try again in a moment.",
    experienceBullets: ["Please retry shortly for tailored experience bullets based on your resume."],
    skills: ["Communication", "Problem Solving"],
    featuredIdeas: ["Portfolio case study", "Resume PDF", "Key project highlights"],
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
        "Based on this resume, write a complete LinkedIn profile including: headline (120 chars), about section (2000 chars, first person), experience bullets for each role, skills list (top 20), featured section ideas. Return valid JSON with keys: headline, about, experienceBullets, skills, featuredIdeas.",
        rawText,
        true
      );
      const parsed = parseJson<LinkedInProfile>(output);
      return NextResponse.json({
        headline: parsed.headline ?? "",
        about: parsed.about ?? "",
        experienceBullets: parsed.experienceBullets ?? [],
        skills: parsed.skills ?? [],
        featuredIdeas: parsed.featuredIdeas ?? [],
      });
    } catch (error) {
      console.error("[talentos/linkedin-profile]", (error as { message?: string })?.message || error);
      return NextResponse.json({ ...fallbackProfile(), degraded: true });
    }
  } catch (error) {
    console.error("[talentos/linkedin-profile]", (error as { message?: string })?.message || error);
    return NextResponse.json({ ...fallbackProfile(), degraded: true });
  }
}
