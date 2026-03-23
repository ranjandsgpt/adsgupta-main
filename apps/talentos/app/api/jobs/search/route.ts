import { NextResponse } from "next/server";
import { z } from "zod";
import { searchJobs } from "@/lib/jobs-service";

const schema = z.object({
  query: z.string(),
  location: z.string().optional().default(""),
  country: z.string().optional().default("us"),
  page: z.number().optional().default(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { query, location, country, page } = parsed.data;
    const jobs = await searchJobs(query, location, country, page);
    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
