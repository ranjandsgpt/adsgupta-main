import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { PRICING, ensureUserForPayment } from "@/lib/payments";
import { generateId } from "@/lib/ids";
import { getCurrentUserFromRequest } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["pro", "weekly"]).default("pro"),
  currency: z.enum(["INR", "USD", "JPY"]).optional(),
  user_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
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
    const { currency, plan } = parsed.data;

    let user_id = parsed.data.user_id ?? "";
    if (!user_id) {
      try {
        const user = await getCurrentUserFromRequest(request);
        user_id = user.user_id;
      } catch {
        user_id = `guest_${Date.now()}`;
      }
    }

    const user = await ensureUserForPayment(user_id);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const priceKey =
      plan === "weekly"
        ? "pro_usd_weekly"
        : currency === "USD"
          ? "pro_usd_monthly"
          : currency === "JPY"
            ? "pro_jpy_monthly"
            : "pro_inr_monthly";
    const selectedPlan = PRICING[priceKey];
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await rzp.orders.create({
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `talentos_${user_id}_${generateId("ord")}`,
      notes: {
        user_id,
        plan_type: "pro",
      },
    });

    await prisma.payment.create({
      data: {
      id: generateId("pay"),
      userId: user_id,
      razorpayOrderId: order.id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      plan: "pro",
      status: "created",
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      key_id: keyId,
      name: selectedPlan.name,
      description: selectedPlan.description,
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
