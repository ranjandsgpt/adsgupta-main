import { prisma } from "./prisma";
import type { User } from "@prisma/client";
import { PLANS } from "./plans";

export const PRICING: Record<
  string,
  { amount: number; currency: string; name: string; description: string }
> = {
  pro_inr_monthly: {
    amount: PLANS.pro.priceINR * 100,
    currency: "INR",
    name: "TalentOS Professional",
    description: "Professional monthly subscription",
  },
  pro_usd_monthly: {
    amount: Math.round(PLANS.pro.priceUSD * 100),
    currency: "USD",
    name: "TalentOS Professional",
    description: "Professional monthly subscription",
  },
};

export async function ensureUserForPayment(userId: string): Promise<User | null> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  if (userId.startsWith("guest_")) {
    const doc = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@guest.talentos.local`,
        name: "Guest",
        credits: PLANS.free.limits.analyses,
        isSubscribed: false,
        passwordHash: "guest_account_no_password",
      },
    });
    return doc;
  }

  return null;
}
