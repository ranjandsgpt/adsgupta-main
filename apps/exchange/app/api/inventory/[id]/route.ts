export const dynamic = "force-dynamic";
import { validateIabSizes } from "@/lib/iab-sizes";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

type AdUnitRow = { publisher_id: string; [key: string]: unknown };

async function loadUnit(id: string): Promise<AdUnitRow | null> {
  const result = await sql`SELECT * FROM ad_units WHERE id = ${id} LIMIT 1`;
  return (result.rows[0] as AdUnitRow | undefined) ?? null;
}

function assertPublisherGate(
  auth: Awaited<ReturnType<typeof getAuthFromRequest>>,
  unit: AdUnitRow,
  bodyPublisherId: unknown
): boolean {
  if (auth) return true;
  return typeof bodyPublisherId === "string" && bodyPublisherId === unit.publisher_id;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const unit = await loadUnit(params.id);
  if (!unit) return json(null);
  if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
  if (auth.role === "demand") return forbidden();
  return json(unit);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const unit = await loadUnit(params.id);
  if (!unit) return json(null);
  if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
  if (auth.role === "demand") return forbidden();

  const body = await request.json();
  if (body.sizes != null && !validateIabSizes(body.sizes)) {
    return badRequest("sizes must be valid IAB standard sizes");
  }
  if (body.floor_price != null) {
    const fp = Number(body.floor_price);
    if (!Number.isFinite(fp) || fp <= 0) return badRequest("floor_price must be greater than 0");
  }
  try {
    const result = await sql`
      UPDATE ad_units SET
        name = COALESCE(${body.name ?? null}, name),
        sizes = COALESCE(${body.sizes ?? null}, sizes),
        ad_type = COALESCE(${body.ad_type ?? null}, ad_type),
        environment = COALESCE(${body.environment ?? null}, environment),
        floor_price = COALESCE(${body.floor_price ?? null}, floor_price),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[inventory PUT]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const body = (await request.json()) as Record<string, unknown>;
  const unit = await loadUnit(params.id);
  if (!unit) return json(null);

  if (auth) {
    if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
    if (auth.role === "demand") return forbidden();
  } else {
    if (!assertPublisherGate(auth, unit, body.publisher_id)) return forbidden("publisher_id required");
  }

  if (body.sizes != null && !validateIabSizes(body.sizes)) {
    return badRequest("sizes must be valid IAB standard sizes");
  }
  if (body.floor_price != null) {
    const fp = Number(body.floor_price);
    if (!Number.isFinite(fp) || fp <= 0) return badRequest("floor_price must be greater than 0");
  }
  if (body.status != null && !["active", "paused", "archived"].includes(String(body.status))) {
    return badRequest("Invalid status");
  }

  try {
    const result = await sql`
      UPDATE ad_units SET
        name = COALESCE(${(body.name ?? null) as string | null}, name),
        sizes = COALESCE(${body.sizes ?? null}, sizes),
        ad_type = COALESCE(${(body.ad_type ?? null) as string | null}, ad_type),
        environment = COALESCE(${(body.environment ?? null) as string | null}, environment),
        floor_price = COALESCE(${body.floor_price ?? null}, floor_price),
        status = COALESCE(${(body.status ?? null) as string | null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[inventory PATCH]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  let bodyPublisher: string | undefined;
  try {
    if (!auth && request.headers.get("content-type")?.includes("application/json")) {
      const body = (await request.json()) as { publisher_id?: string };
      bodyPublisher = body.publisher_id;
    }
  } catch {
    bodyPublisher = undefined;
  }
  const queryPub =
    request.nextUrl.searchParams.get("publisherId") ?? request.nextUrl.searchParams.get("publisher_id");
  const claimedPublisher = bodyPublisher ?? queryPub ?? undefined;

  const unit = await loadUnit(params.id);
  if (!unit) return json({ ok: true });

  if (auth) {
    if (auth.role === "demand") return forbidden();
    if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
    if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();
  } else {
    if (!assertPublisherGate(auth, unit, claimedPublisher)) return forbidden("publisher_id required");
  }

  await sql`UPDATE ad_units SET status = 'archived' WHERE id = ${params.id}`;
  return json({ ok: true });
}
