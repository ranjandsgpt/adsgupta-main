export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function normType(t: string): string {
  const x = (t || "banner").toLowerCase();
  if (x === "image") return "banner";
  return x === "banner" ? "banner" : "banner";
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const campId = request.nextUrl.searchParams.get("campaign_id");
  const emailQ = request.nextUrl.searchParams.get("email");

  if (!auth && campId && emailQ) {
    try {
      const own = await sql`
        SELECT id FROM campaigns
        WHERE id = ${campId} AND COALESCE(advertiser_email, contact_email) = ${emailQ}
        LIMIT 1
      `;
      if (!own.rows[0]) return forbidden();
      const result = await sql`SELECT * FROM creatives WHERE campaign_id = ${campId} ORDER BY created_at DESC`;
      return json(result.rows);
    } catch (e) {
      console.error("[creatives GET public]", e);
      return json({ error: "Failed to load creatives" }, 500);
    }
  }

  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  try {
    if (auth.role === "admin") {
      const result = await sql`SELECT * FROM creatives ORDER BY created_at DESC`;
      return json(result.rows);
    }

    const adv = demandAdvertiserFilter(auth);
    if (!adv) {
      const result = await sql`
        SELECT cr.* FROM creatives cr
        JOIN campaigns c ON c.id = cr.campaign_id
        ORDER BY cr.created_at DESC
      `;
      return json(result.rows);
    }
    const result = await sql`
      SELECT cr.* FROM creatives cr
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

  if (!campaignId || !name) {
    return badRequest("campaign_id and name are required");
  }
  if (!size) {
    return badRequest("size is required (e.g. 300x250)");
  }

  try {
    if (!auth) {
      const camp =
        await sql`SELECT status FROM campaigns WHERE id = ${campaignId} LIMIT 1`;
      const row = camp.rows[0] as { status: string } | undefined;
      if (!row || row.status !== "pending") {
        return forbidden("Creative upload is only allowed for pending registration campaigns");
      }
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
    }

    const result = await sql`
      INSERT INTO creatives (campaign_id, name, type, size, click_url, image_url, html_snippet, vast_url, status)
      VALUES (${campaignId}, ${name}, ${typ}, ${size}, ${clickUrl}, ${imageUrl}, ${htmlSnippet}, ${vastUrl}, 'active')
      RETURNING *
    `;
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[creatives POST]", e);
    return json({ error: "Failed to save creative" }, 500);
  }
}
