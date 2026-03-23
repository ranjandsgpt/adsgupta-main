import { NextResponse } from "next/server";
import { z } from "zod";
import { startInterviewSession } from "@/lib/talentos-service";

const schema = z.object({
  user_id: z.string(),
  job_match_id: z.string().nullable().optional(),
  mode: z.string().default("adtech"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { user_id, job_match_id, mode } = parsed.data;
    const result = await startInterviewSession(user_id, job_match_id, mode);
    return NextResponse.json(result);
  } catch (e) {
    if (String(e) === "Error: USER_NOT_FOUND") {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
