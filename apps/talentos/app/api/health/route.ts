import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  let database = "disconnected";
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    database = "connected";
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
