import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function mapCurrency(country: string, acceptLanguage: string) {
  const c = country.toUpperCase();
  if (c === "IN") return { currency: "INR", label: "₹499/month" };
  if (c === "JP") return { currency: "JPY", label: "¥900/month" };
  if (["US", "GB", "DE", "FR", "AU", "CA", "SG", "BR"].includes(c)) {
    return { currency: "USD", label: "$5.99/month" };
  }
  if (/en-in|hi-in/i.test(acceptLanguage)) return { currency: "INR", label: "₹499/month" };
  if (/ja-jp/i.test(acceptLanguage)) return { currency: "JPY", label: "¥900/month" };
  return { currency: "USD", label: "$5.99/month" };
}

export async function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const resolved = mapCurrency(country, acceptLanguage);
  return NextResponse.json({
    country: country || "unknown",
    currency: resolved.currency,
    priceLabel: resolved.label,
  });
}
