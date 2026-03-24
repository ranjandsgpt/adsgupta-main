export const dynamic = "force-dynamic";
import { formatPublisherAdsTxtLine } from "@/lib/ads-txt-line";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: { publisherId: string } }) {
  const auth = await getAuthFromRequest(_request);
  if (!auth) return unauthorized();
  const publisherId = params.publisherId?.trim() ?? "";
  if (!publisherId) return json({ error: "publisherId required" }, 400);
  if (auth.role === "publisher" && auth.publisherId !== publisherId) return forbidden();
  if (auth.role !== "publisher" && auth.role !== "admin") return forbidden();

  const pub = await sql<{ id: string; name: string; domain: string }>`
    SELECT id, name, domain FROM publishers WHERE id = ${publisherId} LIMIT 1
  `;
  const p = pub.rows[0];
  if (!p) return json({ error: "Publisher not found" }, 404);

  const line = formatPublisherAdsTxtLine(publisherId);
  const exampleAdsTxt = `# ads.txt — ${p.name} (${p.domain})
${line}
# Add the line above to your public https://${p.domain}/ads.txt
`;

  return json({
    publisherId,
    line,
    exampleAdsTxt,
    domain: p.domain
  });
}
