import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { getMonetizationScripts, setMonetizationScript } from "../../../../lib/db.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const scripts = getMonetizationScripts();
  return NextResponse.json(scripts);
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    setMonetizationScript(body.script || "", body.position || "after_paragraph_3");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to save" }, { status: 500 });
  }
}
