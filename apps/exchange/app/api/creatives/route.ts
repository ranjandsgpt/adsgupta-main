export const dynamic = "force-dynamic";
import { scanCreativeUrl } from "@/lib/creative-scanner";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { isValidIabSize } from "@/lib/iab-sizes";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { rateLimitResponse } from "@/lib/rate-limit-http";
import { validateUrl } from "@/lib/validate";
import { NextRequest } from "next/server";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function normType(t: string): string {
  const x = (t || "banner").toLowerCase();
  if (x === "image") return "banner";
  return x === "banner" ? "banner" : "banner";
}

async function verifyCampaignForPublic(campaignId: string, advertiserEmail: string) {
  const result = await sql`
    SELECT id, status, COALESCE(advertiser_email, contact_email) AS em
    FROM campaigns WHERE id = ${campaignId} LIMIT 1
  `;
  const row = result.rows[0] as { id: string; status: string; em: string | null } | undefined;
  if (!row) return { ok: false as const, error: forbidden("Invalid campaign") };
  const em = String(row.em ?? "").trim().toLowerCase();
  const want = advertiserEmail.trim().toLowerCase();
  if (!want || em !== want) return { ok: false as const, error: forbidden() };
  if (row.status !== "pending" && row.status !== "active") {
    return { ok: false as const, error: forbidden("Creative upload is not allowed for this campaign") };
  }
  return { ok: true as const, status: row.status };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const campId =
    request.nextUrl.searchParams.get("campaign_id") ?? request.nextUrl.searchParams.get("campaignId");
  const emailQ = request.nextUrl.searchParams.get("email");

  try {
    if (!auth && emailQ && campId) {
      const own = await sql`
        SELECT id FROM campaigns
        WHERE id = ${campId} AND COALESCE(advertiser_email, contact_email) = ${emailQ}
        LIMIT 1
      `;
      if (!own.rows[0]) return forbidden();
      const result = await sql`
        SELECT cr.*,
        (SELECT COUNT(*)::int FROM impressions WHERE creative_id = cr.id) AS impression_count,
        (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.creative_id = cr.id) AS click_count
        FROM creatives cr
        WHERE cr.campaign_id = ${campId} AND cr.status <> 'archived'
        ORDER BY cr.created_at DESC
      `;
      return json(result.rows);
    }

    if (!auth && emailQ && !campId) {
      const result = await sql`
        SELECT cr.*,
        (SELECT COUNT(*)::int FROM impressions WHERE creative_id = cr.id) AS impression_count,
        (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.creative_id = cr.id) AS click_count
        FROM creatives cr
        JOIN campaigns c ON c.id = cr.campaign_id
        WHERE COALESCE(c.advertiser_email, c.contact_email) = ${emailQ}
          AND cr.status <> 'archived'
        ORDER BY cr.created_at DESC
      `;
      return json(result.rows);
    }

    if (!auth) return unauthorized();
    if (auth.role === "publisher") return forbidden();

    if (auth.role === "admin") {
      const result = await sql`
        SELECT cr.*,
        (SELECT COUNT(*)::int FROM impressions WHERE creative_id = cr.id) AS impression_count,
        (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.creative_id = cr.id) AS click_count
        FROM creatives cr
        ORDER BY cr.created_at DESC
      `;
      return json(result.rows);
    }

    const adv = demandAdvertiserFilter(auth);
    if (!adv) {
      const result = await sql`
        SELECT cr.*,
        (SELECT COUNT(*)::int FROM impressions WHERE creative_id = cr.id) AS impression_count,
        (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.creative_id = cr.id) AS click_count
        FROM creatives cr
        JOIN campaigns c ON c.id = cr.campaign_id
        ORDER BY cr.created_at DESC
      `;
      return json(result.rows);
    }
    const result = await sql`
      SELECT cr.*,
      (SELECT COUNT(*)::int FROM impressions WHERE creative_id = cr.id) AS impression_count,
      (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.creative_id = cr.id) AS click_count
      FROM creatives cr
      JOIN campaigns c ON c.id = cr.campaign_id
      WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
      ORDER BY cr.created_at DESC
    `;
    return json(result.rows);
  } catch (e) {
    console.error("[creatives GET]", e);
    return json({ error: "Failed to list creatives" }, 500);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimitResponse(request, "post:creatives", 20, 60_000);
  if (limited) return limited;

  const auth = await getAuthFromRequest(request);
  const formData = await request.formData();
  const campaignId = formData.get("campaign_id") as string;
  const name = formData.get("name") as string;
  const typeIn = (formData.get("type") as string) ?? "banner";
  const size = (formData.get("size") as string) ?? null;
  const clickUrl = (formData.get("click_url") as string) ?? null;
  const htmlSnippet = (formData.get("html_snippet") as string) ?? null;
  const vastUrl = (formData.get("vast_url") as string) ?? null;
  const typ = normType(typeIn);
  const file = formData.get("file") as File | null;
  const publicEmail = (formData.get("advertiser_email") as string) ?? null;

  if (!campaignId || !name) {
    return badRequest("campaign_id and name are required");
  }
  if (!size) {
    return badRequest("size is required (e.g. 300x250)");
  }
  if (!clickUrl || !String(clickUrl).trim()) {
    return badRequest("click_url is required");
  }
  if (!validateUrl(String(clickUrl).trim())) {
    return badRequest("click_url must be a valid URL");
  }
  if (!size || !isValidIabSize(String(size))) {
    return badRequest("size must be a standard IAB size (e.g. 300x250)");
  }

  try {
    if (!auth) {
      if (!publicEmail?.trim()) {
        return badRequest("advertiser_email is required to verify campaign ownership");
      }
      const gate = await verifyCampaignForPublic(campaignId, publicEmail);
      if (!gate.ok) return gate.error;
    } else if (auth.role === "publisher") {
      return forbidden();
    } else if (auth.role === "demand") {
      const camp = await sql`
        SELECT COALESCE(advertiser_name, advertiser) AS adv FROM campaigns WHERE id = ${campaignId} LIMIT 1
      `;
      const row = camp.rows[0] as { adv: string } | undefined;
      if (!row) return forbidden("Invalid campaign");
      const seat = demandAdvertiserFilter(auth);
      if (seat && row.adv !== seat) return forbidden("Invalid campaign for your seat");
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      if (file.size > MAX_BYTES) return badRequest("File must be 2MB or smaller");
      const mime = file.type || "application/octet-stream";
      if (!ALLOWED.has(mime)) {
        return badRequest("Only JPG, PNG, GIF, or WebP images are allowed");
      }
      const blob = await put(file.name, file, { access: "public" });
      imageUrl = blob.url;
    } else if (!auth || (!htmlSnippet && !vastUrl)) {
      return badRequest("Image file is required");
    }

    let scanPassed = true;
    let scanIssues: string[] = [];
    let scanWarnings: string[] = [];
    let creativeStatus = "active";
    const scannedAt = new Date().toISOString();
    if (imageUrl) {
      const scan = await scanCreativeUrl(imageUrl, String(size));
      scanPassed = scan.passed;
      scanIssues = scan.issues;
      scanWarnings = scan.warnings;
      if (!scan.passed) creativeStatus = "flagged";
    }

    const result = await sql`
      INSERT INTO creatives (
        campaign_id, name, type, size, click_url, image_url, html_snippet, vast_url, status,
        scan_passed, scan_issues, scan_warnings, scanned_at
      )
      VALUES (
        ${campaignId}, ${name}, ${typ}, ${size}, ${clickUrl}, ${imageUrl}, ${htmlSnippet}, ${vastUrl}, ${creativeStatus},
        ${scanPassed}, ${scanIssues}, ${scanWarnings}, ${scannedAt}::timestamptz
      )
      RETURNING id, image_url, size, name, status, scan_passed, scan_issues, scan_warnings
    `;
    const row = result.rows[0] as {
      id: string;
      image_url: string | null;
      size: string;
      name: string;
      status: string;
      scan_passed: boolean;
      scan_issues: string[] | null;
      scan_warnings: string[] | null;
    };
    return json(
      {
        id: row.id,
        image_url: row.image_url,
        size: row.size,
        name: row.name,
        status: row.status,
        scan: {
          passed: row.scan_passed,
          issues: row.scan_issues ?? [],
          warnings: row.scan_warnings ?? []
        }
      },
      201
    );
  } catch (e) {
    console.error("[creatives POST]", e);
    return json({ error: "Failed to save creative" }, 500);
  }
}
