import { NextResponse } from "next/server";
import { PRICING } from "@/lib/payments";

const keyId = process.env.RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
const hasRazorpay = Boolean(keyId && keySecret);

export async function GET() {
  const pricing: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of Object.entries(PRICING)) {
    pricing[k] = {
      ...v,
      amount_display: `₹${(v.amount / 100).toFixed(0)}`,
    };
  }
  return NextResponse.json({
    enabled: hasRazorpay,
    key_id: hasRazorpay ? keyId : null,
    pricing,
  });
}
