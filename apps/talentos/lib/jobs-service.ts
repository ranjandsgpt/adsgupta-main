import type { Db } from "mongodb";
import { generateId } from "./ids";

export const ADTECH_KEYWORDS = [
  "programmatic",
  "dsp",
  "ssp",
  "ad tech",
  "adtech",
  "ad operations",
  "header bidding",
  "prebid",
  "rtb",
  "real-time bidding",
  "yield optimization",
  "demand side",
  "supply side",
  "ad exchange",
  "ad server",
  "google ad manager",
  "dfp",
  "dv360",
  "the trade desk",
  "amazon ads",
  "retail media",
  "advertising technology",
  "campaign manager",
  "media buying",
  "performance marketing",
  "ad trafficking",
];

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
  is_adtech: boolean;
  match_keywords: string[];
};

function extractAdtechKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return ADTECH_KEYWORDS.filter((k) => lower.includes(k));
}

function isAdtechJob(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  return ADTECH_KEYWORDS.some((k) => combined.includes(k));
}

function mockJobs(keywords: string, adtechOnly: boolean): JobSearchResult[] {
  const now = new Date().toISOString();
  const mock: JobSearchResult[] = [
    {
      job_id: "mock_1",
      title: "Senior Programmatic Specialist",
      company: "Publicis Media",
      location: "Mumbai, India",
      description:
        "Looking for experienced programmatic specialists with DSP expertise. Must have experience with DV360, The Trade Desk, and header bidding implementations.",
      salary_min: 1500000,
      salary_max: 2500000,
      url: "https://example.com/job/1",
      created: now,
      is_adtech: true,
      match_keywords: ["programmatic", "dsp", "header bidding", "dv360", "the trade desk"],
    },
    {
      job_id: "mock_2",
      title: "Ad Operations Manager",
      company: "GroupM",
      location: "Bangalore, India",
      description:
        "Manage ad operations for premium publisher clients. Experience with GAM, Prebid, and yield optimization required.",
      salary_min: 1200000,
      salary_max: 1800000,
      url: "https://example.com/job/2",
      created: now,
      is_adtech: true,
      match_keywords: ["ad operations", "prebid", "yield optimization"],
    },
    {
      job_id: "mock_3",
      title: "Yield Optimization Analyst",
      company: "InMobi",
      location: "Bangalore, India",
      description:
        "Drive yield optimization strategies for our mobile ad network. Strong analytical skills and understanding of RTB required.",
      salary_min: 1000000,
      salary_max: 1600000,
      url: "https://example.com/job/3",
      created: now,
      is_adtech: true,
      match_keywords: ["yield optimization", "rtb"],
    },
    {
      job_id: "mock_4",
      title: "DSP Campaign Manager",
      company: "MediaMath",
      location: "Delhi, India",
      description:
        "Manage programmatic campaigns across multiple DSPs. Experience with audience targeting, bid optimization, and performance analysis.",
      salary_min: 800000,
      salary_max: 1400000,
      url: "https://example.com/job/4",
      created: now,
      is_adtech: true,
      match_keywords: ["programmatic", "dsp", "campaign manager"],
    },
    {
      job_id: "mock_5",
      title: "Digital Marketing Manager",
      company: "TCS",
      location: "Chennai, India",
      description:
        "Lead digital marketing initiatives for enterprise clients. Experience with paid media, SEO, and analytics required.",
      salary_min: 1200000,
      salary_max: 2000000,
      url: "https://example.com/job/5",
      created: now,
      is_adtech: false,
      match_keywords: [],
    },
  ];

  let list = adtechOnly ? mock.filter((j) => j.is_adtech) : mock;
  const kl = keywords.toLowerCase();
  if (kl) {
    list = list.filter(
      (j) => j.title.toLowerCase().includes(kl) || j.description.toLowerCase().includes(kl)
    );
  }
  return list;
}

export async function searchJobsApi(
  keywords: string,
  location: string,
  page: number,
  resultsPerPage: number,
  adtechOnly: boolean
): Promise<JobSearchResult[]> {
  const appId = process.env.ADZUNA_APP_ID ?? "";
  const appKey = process.env.ADZUNA_APP_KEY ?? "";
  const hasAdzuna = Boolean(appId && appKey);

  if (!hasAdzuna) {
    return mockJobs(keywords, adtechOnly);
  }

  const countryMap: Record<string, string> = {
    india: "in",
    us: "us",
    usa: "us",
    "united states": "us",
    uk: "gb",
    "united kingdom": "gb",
    australia: "au",
    germany: "de",
    france: "fr",
  };
  const country = countryMap[location.toLowerCase()] ?? "in";
  let searchQuery = keywords;
  if (adtechOnly) searchQuery = `${searchQuery} programmatic adtech`;

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  url.searchParams.set("what", searchQuery);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    return mockJobs(keywords, adtechOnly);
  }

  const data = (await res.json()) as { results?: Record<string, unknown>[] };
  const results = data.results ?? [];
  const jobs: JobSearchResult[] = [];

  for (const job of results) {
    const title = String(job.title ?? "");
    const description = String(job.description ?? "");
    const jobIsAdtech = isAdtechJob(title, description);
    if (adtechOnly && !jobIsAdtech) continue;

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
      job_id: String(job.id ?? generateId("job")),
      title,
      company,
      location: loc,
      description: descShort,
      salary_min: (job.salary_min as number) ?? null,
      salary_max: (job.salary_max as number) ?? null,
      url: String(job.redirect_url ?? ""),
      created: String(job.created ?? ""),
      is_adtech: jobIsAdtech,
      match_keywords: extractAdtechKeywords(`${title} ${description}`),
    });
  }

  return jobs;
}

export async function getRecommendations(db: Db, userId: string, limit: number): Promise<JobSearchResult[]> {
  const resume = await db.collection("resumes").findOne({ user_id: userId }, { projection: { _id: 0 } });
  const parsed = resume?.parsed_data as { skills?: string[] } | undefined;
  if (!parsed?.skills?.length) {
    return searchJobsApi("programmatic advertising", "india", 1, limit, true);
  }
  const searchKeywords = parsed.skills.slice(0, 5).join(" ");
  return searchJobsApi(searchKeywords, "india", 1, limit, true);
}
