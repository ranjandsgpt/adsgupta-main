export const dynamic = "force-dynamic";
import { sendPublisherWelcomeEmail } from "@/lib/email";
import { isValidEmail, normalizeDomain } from "@/lib/domain";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

function normalizePrimaryFormats(body: Record<string, unknown>): string[] {
  if (Array.isArray(body.primary_formats)) {
    return body.primary_formats.filter(
      (x): x is string => typeof x === "string" && ["display", "video", "native"].includes(x)
    );
  }
  const o: string[] = [];
  if (body.format_display) o.push("display");
  if (body.format_video) o.push("video");
  if (body.format_native) o.push("native");
  return o;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  if (auth.role === "admin") {
    const result = await sql`
      SELECT
        p.*,
        (SELECT COUNT(*)::int FROM ad_units u WHERE u.publisher_id = p.id AND u.status <> 'archived') AS ad_units_count,
        (
          SELECT COUNT(*)::int FROM impressions i
          INNER JOIN ad_units u ON u.id = i.ad_unit_id
          WHERE u.publisher_id = p.id AND i.created_at::date = CURRENT_DATE
        ) AS impressions_today,
        (
          SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text FROM impressions i
          INNER JOIN ad_units u ON u.id = i.ad_unit_id
          WHERE u.publisher_id = p.id AND i.created_at::date = CURRENT_DATE
        ) AS revenue_today
      FROM publishers p
      ORDER BY p.created_at DESC
    `;
    return json(result.rows);
  }

  if (auth.role === "publisher") {
    if (!auth.publisherId) return json([]);
    const result = await sql`SELECT * FROM publishers WHERE id = ${auth.publisherId} ORDER BY created_at DESC`;
    return json(result.rows);
  }

  return forbidden();
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = (await request.json()) as Record<string, unknown>;

  if (!body.name || !body.domain) return badRequest("name and domain are required");

  /** Self-registration (no auth): always pending */
  if (!auth) {
    const domain = normalizeDomain(String(body.domain));
    if (!domain) return badRequest("Invalid domain format");
    const email = body.contact_email != null ? String(body.contact_email) : "";
    if (!isValidEmail(email)) return badRequest("Valid contact email is required");
    const primaryFormats = normalizePrimaryFormats(body);
    if (primaryFormats.length === 0) {
      return badRequest("Select at least one primary ad format");
    }
    const result = await sql`
      INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status, primary_ad_formats)
      VALUES (${String(body.name)}, ${domain}, ${email}, false, 'pending', ${primaryFormats})
      RETURNING *
    `;
    const row = result.rows[0] as { id: string; name: string; contact_email: string | null };
    void sendPublisherWelcomeEmail(email, String(body.name), row.id);
    return json(row, 201);
  }

  if (auth.role !== "admin") return forbidden("Only exchange admins can create publishers here");

  const domain = normalizeDomain(String(body.domain)) ?? String(body.domain);
  const adminFormats = normalizePrimaryFormats(body);
  const formatsSql = adminFormats.length > 0 ? adminFormats : null;

  const result = await sql`
    INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status, primary_ad_formats)
    VALUES (
      ${String(body.name)},
      ${domain},
      ${body.contact_email != null ? String(body.contact_email) : null},
      ${Boolean(body.ads_txt_verified)},
      ${String(body.status ?? "active")},
      ${formatsSql}
    )
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
