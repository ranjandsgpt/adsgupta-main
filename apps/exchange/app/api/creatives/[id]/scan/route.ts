export const dynamic = "force-dynamic";
import { scanCreativeUrl } from "@/lib/creative-scanner";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCreative(id: string) {
  const r = await sql`
    SELECT cr.*, COALESCE(c.advertiser_name, c.advertiser) AS campaign_advertiser
    FROM creatives cr
    JOIN campaigns c ON c.id = cr.campaign_id
    WHERE cr.id = ${id} LIMIT 1
  `;
  return r.rows[0] as Record<string, unknown> | undefined;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const row = await loadCreative(params.id);
  if (!row) return badRequest("Creative not found");

  if (auth.role === "publisher") return forbidden();
  if (auth.role === "demand") {
    const seat = demandAdvertiserFilter(auth);
    if (seat && row.campaign_advertiser !== seat) return forbidden();
  }

  const imageUrl = row.image_url != null ? String(row.image_url) : "";
  const size = row.size != null ? String(row.size) : "";
  if (!imageUrl) return badRequest("No image URL to scan");

  const scan = await scanCreativeUrl(imageUrl, size);
  let nextStatus = String(row.status ?? "active");
  if (scan.passed) {
    if (nextStatus === "flagged") nextStatus = "active";
  } else {
    nextStatus = "flagged";
  }

  const upd = await sql`
    UPDATE creatives SET
      scan_passed = ${scan.passed},
      scan_issues = ${scan.issues},
      scan_warnings = ${scan.warnings},
      scanned_at = now(),
      status = ${nextStatus}
    WHERE id = ${params.id}
    RETURNING id, status, scan_passed, scan_issues, scan_warnings, image_url, size
  `;

  const out = upd.rows[0];
  return json({
    creative: out,
    scan: {
      passed: scan.passed,
      issues: scan.issues,
      warnings: scan.warnings,
      iabSizeMatch: scan.iabSizeMatch
    }
  });
}
