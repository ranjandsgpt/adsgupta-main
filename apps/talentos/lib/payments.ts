import { prisma } from "./prisma";
import type { User } from "@prisma/client";
import { PLANS } from "./plans";
import { GUEST_FREE_ANALYSES } from "./credits";

export const PRICING: Record<
  string,
  { amount: number; currency: string; name: string; description: string }
> = {
  pro_usd_weekly: {
    amount: 100,
    currency: "USD",
    name: "TalentOS Weekly",
    description: "Weekly subscription plan",
  },
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
  pro_jpy_monthly: {
    amount: 900,
    currency: "JPY",
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
        credits: GUEST_FREE_ANALYSES,
        isSubscribed: false,
        passwordHash: "guest_account_no_password",
      },
    });
    return doc;
  }

  return null;
}
