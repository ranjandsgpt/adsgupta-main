import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { PRICING, ensureUserForPayment } from "@/lib/payments";
import { generateId } from "@/lib/ids";

export const runtime = "nodejs";

const schema = z.object({
  plan_type: z.string(),
  user_id: z.string(),
});

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID ?? "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
    if (!keyId || !keySecret) {
      return NextResponse.json({ detail: "Payment service not configured" }, { status: 503 });
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { plan_type, user_id } = parsed.data;
    if (!PRICING[plan_type]) {
      return NextResponse.json({ detail: `Invalid plan type. Available: ${Object.keys(PRICING).join(", ")}` }, { status: 400 });
    }

    const user = await ensureUserForPayment(user_id);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const plan = PRICING[plan_type];
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await rzp.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `talentos_${user_id}_${generateId("ord")}`,
      notes: {
        user_id,
        plan_type,
      },
    });

    await prisma.payment.create({
      data: {
      id: generateId("pay"),
      userId: user_id,
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      plan: plan_type,
      status: "created",
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: plan.amount,
      currency: plan.currency,
      key_id: keyId,
      name: plan.name,
      description: plan.description,
      prefill: {
        name: user.name ?? "",
        email: user.email,
        contact: "",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Failed to create payment order" }, { status: 500 });
  }
}
