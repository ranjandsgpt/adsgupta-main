import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseResumeBuffer } from "@/lib/resume-parser";
import { generateLLMResponse } from "@/lib/llm";

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
      const rewrittenText = await generateLLMResponse(
        "Rewrite this resume to be stronger. Keep same experience but improve: action verbs, quantified achievements, ATS keywords, formatting. Return as clean text.",
        rawText
      );
      return NextResponse.json({ rewrittenText: rewrittenText.trim() || "AI rewrite temporarily unavailable." });
    } catch (error) {
      console.error("[talentos/rewrite-resume]", (error as { message?: string })?.message || error);
      return NextResponse.json({
        rewrittenText:
          "Resume uploaded successfully. AI rewrite is temporarily unavailable. Please copy your current resume and retry in a moment.",
        degraded: true,
      });
    }
  } catch (error) {
    console.error("[talentos/rewrite-resume]", (error as { message?: string })?.message || error);
    return NextResponse.json(
      {
        rewrittenText:
          "Resume uploaded successfully. AI rewrite is temporarily unavailable. Please copy your current resume and retry in a moment.",
        degraded: true,
      },
      { status: 200 }
    );
  }
}
