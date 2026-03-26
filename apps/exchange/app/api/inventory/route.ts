export const dynamic = "force-dynamic";
import { validateIabSizes } from "@/lib/iab-sizes";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { validateRequired } from "@/lib/validate";
import { NextRequest } from "next/server";

const AD_TYPES = new Set(["display", "video", "native"]);
const ENVS = new Set(["web", "app", "ctv"]);

function normAdType(raw: string): string {
  const s = String(raw || "display").toLowerCase();
  if (AD_TYPES.has(s)) return s;
  return "display";
}

function normEnv(raw: string): string {
  const s = String(raw || "web").toLowerCase();
  if (ENVS.has(s)) return s;
  return "web";
}

function resolvePublisherId(request: NextRequest): string | null {
  return (
    request.nextUrl.searchParams.get("publisherId") ?? request.nextUrl.searchParams.get("publisher_id") ?? null
  );
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const publisherId = resolvePublisherId(request);

  try {
    if (!auth && publisherId) {
      const pub = await sql<{ status: string }>`SELECT status FROM publishers WHERE id = ${publisherId} LIMIT 1`;
      if (!pub.rows[0]) return json({ error: "Publisher not found" }, 404);
      const result = await sql`
        SELECT
          u.id,
          u.publisher_id,
          u.name,
          u.sizes,
          u.ad_type,
          u.environment,
          u.floor_price::text,
          u.status,
          u.created_at,
          p.name AS publisher_name,
          p.domain AS publisher_domain,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS impressions_24h,
          (
            SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS revenue_24h,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at::date = CURRENT_DATE
          ) AS impressions_today
        FROM ad_units u
        INNER JOIN publishers p ON p.id = u.publisher_id
        WHERE u.publisher_id = ${publisherId} AND u.status <> 'archived'
        ORDER BY u.created_at DESC
      `;
      return json(result.rows);
    }

    if (!auth) return unauthorized();

    if (auth.role === "admin") {
      const result = await sql`
        SELECT
          u.id,
          u.publisher_id,
          u.name,
          u.sizes,
          u.ad_type,
          u.environment,
          u.floor_price::text,
          u.status,
          u.created_at,
          p.name AS publisher_name,
          p.domain AS publisher_domain,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS impressions_24h,
          (
            SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS revenue_24h,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at::date = CURRENT_DATE
          ) AS impressions_today
        FROM ad_units u
        INNER JOIN publishers p ON p.id = u.publisher_id
        WHERE u.status <> 'archived'
        ORDER BY u.created_at DESC
      `;
      return json(result.rows);
    }

    if (auth.role === "publisher") {
      const allowed = (auth.publisherIds ?? (auth.publisherId ? [auth.publisherId] : [])).filter(Boolean);
      if (allowed.length === 0) return json([]);
      const result = await sql`
        SELECT
          u.id,
          u.publisher_id,
          u.name,
          u.sizes,
          u.ad_type,
          u.environment,
          u.floor_price::text,
          u.status,
          u.created_at,
          p.name AS publisher_name,
          p.domain AS publisher_domain,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS impressions_24h,
          (
            SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at >= NOW() - INTERVAL '24 hours'
          ) AS revenue_24h,
          (
            SELECT COUNT(*)::text
            FROM impressions i
            WHERE i.ad_unit_id = u.id AND i.created_at::date = CURRENT_DATE
          ) AS impressions_today
        FROM ad_units u
        INNER JOIN publishers p ON p.id = u.publisher_id
        WHERE u.publisher_id = ANY(${allowed}::uuid[]) AND u.status <> 'archived'
        ORDER BY u.created_at DESC
      `;
      return json(result.rows);
    }

    return forbidden();
  } catch (e) {
    console.error("[inventory GET]", e);
    return json({ error: "Failed to list ad units" }, 500);
  }
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const auth = await getAuthFromRequest(request);
  const body = await request.json() as Record<string, unknown>;

  const miss = validateRequired(body, ["publisher_id", "name", "ad_type", "environment", "sizes", "floor_price"]);
  if (miss) return badRequest(miss, { startedAt: started });

  if (!validateIabSizes(body.sizes)) {
    return badRequest("sizes must be a non-empty array of valid IAB standard sizes", { startedAt: started });
  }

  const floorNum = Number(body.floor_price);
  if (!Number.isFinite(floorNum) || floorNum < 0.01) {
    return badRequest("floor_price must be between 0.01 and 100", { startedAt: started });
  }
  if (floorNum > 100) {
    return badRequest("floor_price must be at most 100", { startedAt: started });
  }

  const adType = normAdType(String(body.ad_type ?? ""));
  const env = normEnv(String(body.environment ?? ""));
  if (!AD_TYPES.has(adType)) return badRequest("ad_type must be display, video, or native");
  if (!ENVS.has(env)) return badRequest("environment must be web, app, or ctv");

  const pub = await sql<{ status: string }>`SELECT status FROM publishers WHERE id = ${body.publisher_id} LIMIT 1`;
  if (!pub.rows[0]) return badRequest("Publisher not found");
  if (pub.rows[0].status !== "active") {
    return badRequest("Publisher must be active before creating ad units");
  }

  try {
    if (!auth) {
      const result = await sql`
        INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
        VALUES (${body.publisher_id}, ${body.name}, ${body.sizes}, ${adType}, ${env}, ${floorNum}, 'active')
        RETURNING *
      `;
      return json(result.rows[0], 201);
    }

    if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

    if (auth.role === "publisher") {
      if (!auth.publisherId || body.publisher_id !== auth.publisherId) {
        return forbidden("Cannot create inventory for another publisher");
      }
    }

    const result = await sql`
      INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
      VALUES (${body.publisher_id}, ${body.name}, ${body.sizes}, ${adType}, ${env}, ${floorNum}, 'active')
      RETURNING *
    `;
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[inventory POST]", e);
    return json({ error: "Failed to create ad unit" }, 500);
  }
}
