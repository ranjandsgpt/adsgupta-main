import { NextResponse } from "next/server";
import { ADTECH_KEYWORDS } from "@/lib/jobs-service";

export async function GET() {
  const hasAdzuna = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
  return NextResponse.json({
    adzuna_enabled: hasAdzuna,
    supported_countries: ["in", "us", "gb", "au", "de", "fr"],
    adtech_keywords: ADTECH_KEYWORDS.slice(0, 10),
  });
}
