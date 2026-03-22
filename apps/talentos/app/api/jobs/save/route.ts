import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { generateId } from "@/lib/ids";

const jobSchema = z.object({
  job_id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  url: z.string(),
  created: z.string(),
  is_adtech: z.boolean(),
  match_keywords: z.array(z.string()).optional(),
});

const schema = z.object({
  user_id: z.string(),
  job: jobSchema,
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { user_id, job } = parsed.data;
    const db = await getDb();
    const jobId = generateId("saved");
    const saved = {
      job_id: jobId,
      user_id,
      source: "adzuna",
      external_id: job.job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      url: job.url,
      is_adtech: job.is_adtech,
      skills: job.match_keywords ?? [],
      created_at: new Date().toISOString(),
    };
    await db.collection("saved_jobs").insertOne(saved);
    return NextResponse.json({ success: true, job_id: jobId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
