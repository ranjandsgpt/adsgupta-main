import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLLMResponse, hasLlm } from "@/lib/llm";

const schema = z.object({
  resume_text: z.string(),
  jd_text: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    if (!hasLlm()) {
      return NextResponse.json({ detail: "AI features require configuration" }, { status: 503 });
    }
    const result = await generateLLMResponse(
      "You are a resume optimization assistant. Return valid JSON only.",
      `Resume:\n${parsed.data.resume_text.slice(0, 2500)}\n\nJD:\n${parsed.data.jd_text.slice(0, 2000)}\n\nReturn JSON {"highImpactSwaps": string[], "missingKeywords": string[], "summary": string}`,
      true
    );
    const parsedJson = JSON.parse((result.match(/\{[\s\S]*\}/) || ["{}"])[0]);
    return NextResponse.json(parsedJson);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
