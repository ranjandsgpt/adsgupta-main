import { NextResponse } from "next/server";
import { hasLlm } from "@/lib/llm";
import { ADTECH_KNOWLEDGE_BASE } from "@/lib/adtech-knowledge";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "talentos",
    llm_available: hasLlm(),
    knowledge_base_categories: ADTECH_KNOWLEDGE_BASE.length,
    timestamp: new Date().toISOString(),
  });
}
