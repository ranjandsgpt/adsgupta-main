import { NextResponse } from "next/server";
import { z } from "zod";
import { generateResumeBrief } from "@/lib/talentos-service";

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
    const result = await generateResumeBrief(parsed.data.resume_text, parsed.data.jd_text);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
