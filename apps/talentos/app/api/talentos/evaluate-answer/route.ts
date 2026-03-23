import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLLMResponse, hasLlm } from "@/lib/llm";

const schema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  session_id: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { question, answer, category } = parsed.data;
    if (!hasLlm()) {
      return NextResponse.json({ detail: "AI features require configuration" }, { status: 503 });
    }
    const raw = await generateLLMResponse(
      "You are an interview evaluator. Return valid JSON only.",
      `Question: ${question}\nCategory: ${category}\nAnswer: ${answer}\nReturn JSON: {"score": number, "feedback": string, "nextTip": string}`,
      true
    );
    const parsedResult = JSON.parse((raw.match(/\{[\s\S]*\}/) || ["{}"])[0]) as {
      score?: number;
      feedback?: string;
      nextTip?: string;
    };
    const result = {
      score: Math.max(0, Math.min(100, Number(parsedResult.score ?? 0))),
      feedback: parsedResult.feedback ?? "Good attempt. Add more concrete outcomes.",
      nextTip: parsedResult.nextTip ?? "Use STAR structure and include measurable impact.",
    };
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
