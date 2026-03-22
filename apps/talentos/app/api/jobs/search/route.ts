import { NextResponse } from "next/server";
import { z } from "zod";
import { searchJobsApi } from "@/lib/jobs-service";

const schema = z.object({
  keywords: z.string(),
  location: z.string().optional().default("india"),
  page: z.number().optional().default(1),
  results_per_page: z.number().optional().default(10),
  adtech_only: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { keywords, location, page, results_per_page, adtech_only } = parsed.data;
    const jobs = await searchJobsApi(keywords, location, page, results_per_page, adtech_only);
    return NextResponse.json(jobs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
