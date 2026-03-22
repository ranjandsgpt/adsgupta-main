import { NextResponse } from "next/server";
import { listQuestions } from "@/lib/talentos-service";

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty") ?? "all";
  const result = listQuestions(params.category ?? "all", difficulty);
  return NextResponse.json(result);
}
