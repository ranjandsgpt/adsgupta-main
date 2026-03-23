import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const paymentsRaw = await prisma.payment.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const payments = paymentsRaw.map((p) => ({
      payment_id: p.id,
      user_id: p.userId,
      razorpay_order_id: p.razorpayOrderId,
      razorpay_payment_id: p.razorpayPaymentId,
      amount: p.amount,
      currency: p.currency,
      plan_type: p.plan,
      status: p.status,
      created_at: p.createdAt.toISOString(),
    }));
    return NextResponse.json({ payments });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
