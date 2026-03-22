import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
  }
  const url = parsed.data.url.toLowerCase();
  const valid = ["linkedin.com", "naukri.com", "indeed.com"].some((d) => url.includes(d));
  if (!valid) {
    return NextResponse.json(
      { detail: "Only LinkedIn, Naukri, and Indeed URLs are supported" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    title: "Senior Programmatic Specialist",
    company: "Extracted Company Name",
    location: "Mumbai, India",
    description: `
We are looking for a Senior Programmatic Specialist to join our team.

Requirements:
- 5+ years experience in programmatic advertising
- Expert knowledge of DSP platforms (DV360, The Trade Desk)
- Experience with header bidding (Prebid.js)
- Strong analytical skills and Excel proficiency
- Understanding of RTB auction mechanics

Responsibilities:
- Manage programmatic campaigns across multiple DSPs
- Optimize campaign performance and ROAS
- Work with publishers on header bidding implementation
- Analyze data and provide strategic recommendations
    `.trim(),
    skills: ["programmatic", "dsp", "dv360", "the trade desk", "header bidding", "prebid", "rtb"],
    url: parsed.data.url,
  });
}
