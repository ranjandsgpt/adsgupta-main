export const dynamic = "force-dynamic";
import { getDashboardPayload } from "@/lib/get-dashboard";
import { json } from "@/lib/http";
import { getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const payload = await getDashboardPayload(auth);
  if (!payload) return unauthorized();
  return json(payload);
}
