import { NextResponse } from "next/server";
import { hasLlm } from "@/lib/llm";

export async function GET() {
  try {
    return NextResponse.json({
      status: "healthy",
      service: "talentos",
      llm_available: hasLlm(),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Health check failed" }, { status: 500 });
  }
}
