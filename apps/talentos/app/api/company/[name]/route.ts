import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyIntel } from "@/lib/company-intelligence";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { checkCredits } from "@/lib/credits";
import type { NextRequest } from "next/server";

const TTL_DAYS = 7;

async function ensureCacheTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS company_intel_cache (
      company_name TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    let userId = "";
    try {
      const user = await getCurrentUserFromRequest(request);
      userId = user.user_id;
    } catch {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: "Company intelligence requires TalentOS Pro." },
        { status: 403 }
      );
    }
    const creditCheck = await checkCredits(userId, "company_intel");
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: creditCheck.message },
        { status: 403 }
      );
    }

    const companyName = decodeURIComponent(params.name);
    if (!companyName) {
      return NextResponse.json({ detail: "Company name is required" }, { status: 400 });
    }
    await ensureCacheTable();

    const cached = (await prisma.$queryRawUnsafe(
      `SELECT payload, created_at FROM company_intel_cache WHERE company_name = $1 LIMIT 1`,
      companyName
    )) as Array<{ payload: unknown; created_at: Date }>;

    if (cached[0]) {
      const ageMs = Date.now() - new Date(cached[0].created_at).getTime();
      if (ageMs < TTL_DAYS * 24 * 60 * 60 * 1000) {
        return NextResponse.json({ payload: cached[0].payload, cached: true });
      }
    }

    const intel = await getCompanyIntel(companyName);
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO company_intel_cache (company_name, payload, created_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (company_name)
      DO UPDATE SET payload = EXCLUDED.payload, created_at = NOW()
      `,
      companyName,
      JSON.stringify(intel)
    );
    return NextResponse.json({ payload: intel, cached: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Failed to generate company intelligence" }, { status: 500 });
  }
}
