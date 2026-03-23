import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getSmartRecommendations } from "@/lib/jobs-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const jobs = await getSmartRecommendations(user.user_id);
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
