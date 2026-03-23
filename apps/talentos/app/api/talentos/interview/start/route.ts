import { NextResponse } from "next/server";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { startInterview } from "@/lib/interview-engine";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { checkCredits } from "@/lib/credits";

const schema = z.object({
  analysisId: z.string(),
  persona: z.enum(["recruiter", "hiring_manager", "technical_peer", "bar_raiser"]).default("hiring_manager"),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    let userId = parsed.data.userId;
    if (!userId) {
      try {
        userId = (await getCurrentUserFromRequest(request)).user_id;
      } catch {
        userId = undefined;
      }
    }
    if (!userId) {
      return NextResponse.json({ detail: "Missing user identity" }, { status: 400 });
    }
    const creditCheck = await checkCredits(userId, "interview");
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "upgrade_required", plan: "pro", message: creditCheck.message },
        { status: 403 }
      );
    }

    const result = await startInterview(parsed.data.analysisId, parsed.data.persona, userId);
    return NextResponse.json(result);
  } catch (e) {
    if (String(e) === "Error: ANALYSIS_NOT_FOUND") return NextResponse.json({ detail: "Analysis not found" }, { status: 404 });
    if (String(e) === "Error: UNAUTHORIZED") return NextResponse.json({ detail: "Unauthorized" }, { status: 403 });
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
