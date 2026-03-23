import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    if (!payment) {
      return NextResponse.json({ detail: "Payment order not found" }, { status: 404 });
    }

    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: "captured",
      },
    });

    const planType = payment.plan;

    if (["pro_monthly", "pro_yearly", "pro_trial"].includes(planType)) {
      await prisma.user.update({
        where: { id: user_id },
        data: { isSubscribed: true },
      });
    } else if (planType === "credits_10") {
      await prisma.user.update({
        where: { id: user_id },
        data: { credits: { increment: 10 } },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user_id },
      select: { id: true, email: true, name: true, credits: true, isSubscribed: true },
    });

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
