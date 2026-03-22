import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
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
    const db = await getDb();
    const { user_id, job_match_id, mode } = parsed.data;
    const result = await startInterviewSession(db, user_id, job_match_id, mode);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
