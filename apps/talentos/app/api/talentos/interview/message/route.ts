import { NextResponse } from "next/server";
import { z } from "zod";
import { processAnswer } from "@/lib/interview-engine";

const schema = z.object({
  interviewId: z.string(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { interviewId, message } = parsed.data;
    try {
      const result = await processAnswer(interviewId, message);
      return NextResponse.json(result);
    } catch (err) {
      if (String(err) === "Error: INTERVIEW_NOT_FOUND") return NextResponse.json({ detail: "Interview not found" }, { status: 404 });
      if (String(err) === "Error: ALREADY_COMPLETED") return NextResponse.json({ detail: "Interview already completed" }, { status: 400 });
      throw err;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
