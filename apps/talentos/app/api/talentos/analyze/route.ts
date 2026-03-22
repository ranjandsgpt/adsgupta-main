import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResumeJd } from "@/lib/talentos-service";

const schema = z.object({
  resume_text: z.string(),
  jd_text: z.string(),
  linkedin_url: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { resume_text, jd_text } = parsed.data;
    const result = await analyzeResumeJd(resume_text, jd_text);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
