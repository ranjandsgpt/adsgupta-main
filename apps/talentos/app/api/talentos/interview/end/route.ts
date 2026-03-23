import { NextResponse } from "next/server";
import { z } from "zod";
import { endInterview } from "@/lib/interview-engine";

const schema = z.object({
  interviewId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const report = await endInterview(parsed.data.interviewId);
    return NextResponse.json(report);
  } catch (e) {
    if (String(e) === "Error: INTERVIEW_NOT_FOUND") {
      return NextResponse.json({ detail: "Interview not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
