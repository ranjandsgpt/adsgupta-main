import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let database = "disconnected";
  try {
    if (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_URL) {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    }
  } catch {
    database = "disconnected";
  }

  return NextResponse.json({
    status: "healthy",
    database,
    services: {
      auth: "active",
      talentos: "active",
      payments: "active",
      jobs: "active",
    },
  });
}
