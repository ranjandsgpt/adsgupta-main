import { NextResponse } from "next/server";
import { z } from "zod";
import { processInterviewMessage } from "@/lib/talentos-service";

const schema = z.object({
  session_id: z.string(),
  user_message: z.string(),
  is_audio: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { session_id, user_message } = parsed.data;
    try {
      const result = await processInterviewMessage(session_id, user_message);
      return NextResponse.json(result);
    } catch (err) {
      if (String(err) === "Error: NOT_FOUND") {
        return NextResponse.json({ detail: "Session not found" }, { status: 404 });
      }
      if (String(err) === "Error: ALREADY_COMPLETED") {
        return NextResponse.json({ detail: "Session already completed" }, { status: 400 });
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
