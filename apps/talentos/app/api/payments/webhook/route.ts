import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  if (!keyId || !keySecret) {
    return NextResponse.json({ status: "ignored", reason: "Razorpay not configured" });
  }

  const signature = request.headers.get("X-Razorpay-Signature") ?? "";
  const bodyText = await request.text();

  if (webhookSecret) {
    const expected = crypto.createHmac("sha256", webhookSecret).update(bodyText).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ detail: "Invalid webhook signature" }, { status: 400 });
    }
  }

  let eventData: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  try {
    eventData = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const eventType = eventData.event;

  if (eventType === "payment.captured") {
    const paymentEntity = eventData.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id as string | undefined;
    const paymentId = paymentEntity?.id as string | undefined;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { razorpayPaymentId: paymentId, status: "captured" },
      });
    }
  } else if (eventType === "payment.failed") {
    const paymentEntity = eventData.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id as string | undefined;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "failed" },
      });
    }
  }

  return NextResponse.json({ status: "processed", event: eventType });
}
