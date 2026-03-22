import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateAnswer } from "@/lib/talentos-service";

const schema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  session_id: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { question, answer } = parsed.data;
    const result = await evaluateAnswer(question, answer);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
