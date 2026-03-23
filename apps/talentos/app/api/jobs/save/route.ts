import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user && user_id.startsWith("guest_")) {
      await prisma.user.create({
        data: {
          id: user_id,
          email: `${user_id}@guest.talentos.local`,
          name: "Guest",
          passwordHash: "guest_account_no_password",
          credits: 3,
        },
      });
    }
    const saved = await prisma.savedJob.upsert({
      where: { userId_url: { userId: user_id, url: job.url } },
      create: {
        userId: user_id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        source: "adzuna",
        matchScore: job.match_keywords?.length ? Math.min(job.match_keywords.length * 10, 100) : null,
      },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        matchScore: job.match_keywords?.length ? Math.min(job.match_keywords.length * 10, 100) : null,
      },
    });
    return NextResponse.json({ success: true, job_id: saved.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
