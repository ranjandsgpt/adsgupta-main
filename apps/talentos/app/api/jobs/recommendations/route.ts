import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getSmartRecommendations } from "@/lib/jobs-service";
import { checkCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const creditCheck = await checkCredits(user.user_id, "smart_recommendations");
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: creditCheck.message },
        { status: 403 }
      );
    }
    const jobs = await getSmartRecommendations(user.user_id);
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
}
