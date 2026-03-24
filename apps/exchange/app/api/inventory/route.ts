export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
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

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const publisherId = request.nextUrl.searchParams.get("publisher_id");

  try {
    if (!auth && publisherId) {
      const pub = await sql`SELECT status FROM publishers WHERE id = ${publisherId} LIMIT 1`;
      if (pub.rows[0]?.status !== "active") return forbidden();
      const result =
        await sql`SELECT id, name, sizes, ad_type, environment, floor_price, status, created_at, publisher_id FROM ad_units WHERE publisher_id = ${publisherId} ORDER BY created_at DESC`;
      return json(result.rows);
    }

    if (!auth) return unauthorized();

    if (auth.role === "admin") {
      const result = await sql`SELECT * FROM ad_units ORDER BY created_at DESC`;
      return json(result.rows);
    }

    if (auth.role === "publisher") {
      if (!auth.publisherId) return json([]);
      const result =
        await sql`SELECT * FROM ad_units WHERE publisher_id = ${auth.publisherId} ORDER BY created_at DESC`;
      return json(result.rows);
    }

    return forbidden();
  } catch (e) {
    console.error("[inventory GET]", e);
    return json({ error: "Failed to list ad units" }, 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json();

  if (!body.publisher_id || !body.name || !body.ad_type || !body.environment) {
    return badRequest("publisher_id, name, ad_type, environment are required");
  }

  const adType = normAdType(body.ad_type);
  const env = normEnv(body.environment);
  if (!AD_TYPES.has(adType)) return badRequest("ad_type must be display, video, or native");
  if (!ENVS.has(env)) return badRequest("environment must be web, app, or ctv");

  try {
    if (!auth) {
      const pub = await sql`SELECT status FROM publishers WHERE id = ${body.publisher_id} LIMIT 1`;
      const status = pub.rows[0]?.status as string | undefined;
      if (status !== "active") {
        return forbidden("Publisher must be active before creating ad units");
      }
      const result = await sql`
        INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
        VALUES (${body.publisher_id}, ${body.name}, ${body.sizes ?? ["300x250"]}, ${adType}, ${env}, ${body.floor_price ?? 0.5}, ${body.status ?? "active"})
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
      VALUES (${body.publisher_id}, ${body.name}, ${body.sizes ?? ["300x250"]}, ${adType}, ${env}, ${body.floor_price ?? 0.5}, ${body.status ?? "active"})
      RETURNING *
    `;
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[inventory POST]", e);
    return json({ error: "Failed to create ad unit" }, 500);
  }
}
