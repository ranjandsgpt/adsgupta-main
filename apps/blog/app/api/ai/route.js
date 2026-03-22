import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth.js";
import { runAiAction } from "../../../lib/ai-actions.js";

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { status, body: out } = await runAiAction(body);
    return NextResponse.json(out, { status });
  } catch (e) {
    return NextResponse.json({ error: e.message || "AI failed" }, { status: 500 });
  }
}
