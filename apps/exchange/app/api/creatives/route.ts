export const dynamic = "force-dynamic";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM creatives ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const campaignId = formData.get("campaign_id") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) ?? "image";
  const size = (formData.get("size") as string) ?? null;
  const clickUrl = (formData.get("click_url") as string) ?? null;
  const htmlSnippet = (formData.get("html_snippet") as string) ?? null;
  const vastUrl = (formData.get("vast_url") as string) ?? null;
  const file = formData.get("file") as File | null;

  let imageUrl: string | null = null;
  if (file) {
    const blob = await put(file.name, file, { access: "public" });
    imageUrl = blob.url;
  }

  const result = await sql`
    INSERT INTO creatives (campaign_id, name, type, size, click_url, image_url, html_snippet, vast_url, status)
    VALUES (${campaignId}, ${name}, ${type}, ${size}, ${clickUrl}, ${imageUrl}, ${htmlSnippet}, ${vastUrl}, 'active')
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
