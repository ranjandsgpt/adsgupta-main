import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "TalentOS API",
    status: "healthy",
    version: "2.0.0",
  });
}
