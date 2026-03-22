import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  user_id: z.string(),
});

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (!secret) {
      return NextResponse.json({ detail: "Payment service not configured" }, { status: 503 });
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = parsed.data;

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (expected !== razorpay_signature) {
      return NextResponse.json({ detail: "Invalid payment signature" }, { status: 400 });
    }

    const db = await getDb();
    const payment = await db.collection("payments").findOne({ razorpay_order_id }, { projection: { _id: 0 } });
    if (!payment) {
      return NextResponse.json({ detail: "Payment order not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    await db.collection("payments").updateOne(
      { razorpay_order_id },
      {
        $set: {
          razorpay_payment_id,
          razorpay_signature,
          status: "captured",
          updated_at: now,
        },
      }
    );

    const planType = payment.plan_type as string;
    const updateFields: Record<string, unknown> = { updated_at: now };

    if (["pro_monthly", "pro_yearly", "pro_trial"].includes(planType)) {
      updateFields.is_pro = true;
      updateFields.razorpay_sub_id = razorpay_payment_id;
    } else if (planType === "credits_10") {
      const user = await db.collection("users").findOne({ user_id }, { projection: { _id: 0 } });
      const current = (user?.credits as number) ?? 0;
      updateFields.credits = current + 10;
    }

    await db.collection("users").updateOne({ user_id }, { $set: updateFields });

    const updatedUser = await db.collection("users").findOne({ user_id }, { projection: { _id: 0, password_hash: 0 } });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      plan_type: planType,
      user: updatedUser,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Payment verification failed" }, { status: 400 });
  }
}
