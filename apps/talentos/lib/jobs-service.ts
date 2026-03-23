import { prisma } from "./prisma";
import { generateLLMResponse, hasLlm } from "./llm";

const COUNTRY_MAP: Record<string, string> = {
  uk: "gb",
  gb: "gb",
  us: "us",
  in: "in",
  india: "in",
  au: "au",
  de: "de",
  fr: "fr",
  jp: "jp",
  ca: "ca",
  br: "br",
  sg: "sg",
};

export const ADTECH_KEYWORDS: string[] = [];

export type JobSearchResult = {
  job_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  created: string;
  match_score?: number | null;
  match_reason?: string | null;
};

function normalizeCountry(country?: string): string {
  if (!country) return "us";
  const key = country.trim().toLowerCase();
  return COUNTRY_MAP[key] ?? "us";
}

function mockJobs(query: string, location: string): JobSearchResult[] {
  const now = new Date().toISOString();
  const mock: JobSearchResult[] = [
    {
      job_id: "mock_1",
      title: `${query || "Senior Marketing Manager"}`,
      company: "Publicis Media",
      location: location || "Remote",
      description:
        "We're hiring for a high-impact role with cross-functional collaboration, measurable growth goals, and strong communication requirements.",
      salary_min: 1500000,
      salary_max: 2500000,
      url: "https://example.com/job/1",
      created: now,
    },
    {
      job_id: "mock_2",
      title: `${query || "Growth Lead"}`,
      company: "GroupM",
      location: location || "Remote",
      description:
        "Lead strategy and execution with ownership across planning, experimentation, and stakeholder communication.",
      salary_min: 1200000,
      salary_max: 1800000,
      url: "https://example.com/job/2",
      created: now,
    },
  ];
  return mock;
}

export async function searchJobs(
  query: string,
  location: string,
  country: string,
  page: number
): Promise<JobSearchResult[]> {
  const appId = process.env.ADZUNA_APP_ID ?? "";
  const appKey = process.env.ADZUNA_APP_KEY ?? "";
  const hasAdzuna = Boolean(appId && appKey);

  if (!hasAdzuna) {
    return mockJobs(query, location);
  }

  const normalizedCountry = normalizeCountry(country);

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${normalizedCountry}/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("what", query);
  if (location) url.searchParams.set("where", location);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    return mockJobs(query, location);
  }

  const data = (await res.json()) as { results?: Record<string, unknown>[] };
  const results = data.results ?? [];
  const jobs: JobSearchResult[] = [];

  for (const job of results) {
    const title = String(job.title ?? "");
    const description = String(job.description ?? "");

    const company =
      typeof job.company === "object" && job.company !== null && "display_name" in job.company
        ? String((job.company as { display_name?: string }).display_name ?? "Unknown")
        : "Unknown";
    const loc =
      typeof job.location === "object" && job.location !== null && "display_name" in job.location
        ? String((job.location as { display_name?: string }).display_name ?? "")
        : "";

    const descShort = description.length > 500 ? `${description.slice(0, 500)}...` : description;

    jobs.push({
      job_id: String(job.id ?? `${title}-${company}`),
      title,
      company,
      location: loc,
      description: descShort,
      salary_min: (job.salary_min as number) ?? null,
      salary_max: (job.salary_max as number) ?? null,
      url: String(job.redirect_url ?? ""),
      created: String(job.created ?? ""),
    });
  }

  return jobs;
}

export async function getSmartRecommendations(userId: string): Promise<JobSearchResult[]> {
  const [latestAnalysis, latestResume, user] = await Promise.all([
    prisma.analysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!latestAnalysis) return [];

  const country = user?.country ?? "us";
  const baseJobs = await searchJobs(
    latestAnalysis.roleName || "software engineer",
    user?.targetRole ?? "",
    country,
    1
  );

  if (!hasLlm() || !latestResume) return baseJobs;

  const resumeSummary = latestResume.rawText.slice(0, 1000);
  const skills = JSON.stringify(latestResume.skills ?? {});
  const scoredJobs: JobSearchResult[] = [];

  for (const job of baseJobs.slice(0, 20)) {
    try {
      const llmRaw = await generateLLMResponse(
        "You are a strict JSON scorer. Return only valid JSON.",
        `Given this candidate's profile: ${resumeSummary}, skills: ${skills}
Rate this job's match (0-100) and give a 1-line reason:
Job: ${job.title} at ${job.company} — ${job.description}
Return JSON: { "matchScore": number, "reason": "1 line" }`,
        true
      );
      const parsed = JSON.parse((llmRaw.match(/\{[\s\S]*\}/) || ["{}"])[0]) as {
        matchScore?: number;
        reason?: string;
      };
      scoredJobs.push({
        ...job,
        match_score: Math.max(0, Math.min(100, Number(parsed.matchScore ?? 0))),
        match_reason: parsed.reason ?? "",
      });
    } catch {
      scoredJobs.push({ ...job, match_score: null, match_reason: null });
    }
  }

  return scoredJobs.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
}

export async function getRecommendations(userId: string, _limit = 20): Promise<JobSearchResult[]> {
  return getSmartRecommendations(userId);
}

export async function getSavedJobs(userId: string) {
  const saved = await prisma.savedJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return saved.map((j) => ({
    job_id: j.id,
    title: j.title,
    company: j.company,
    location: j.location ?? "",
    description: "",
    salary_min: null,
    salary_max: null,
    url: j.url,
    created: j.createdAt.toISOString(),
    match_score: j.matchScore,
    match_reason: null,
  }));
}
