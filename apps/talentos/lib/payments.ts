import { prisma } from "./prisma";
import type { User } from "@prisma/client";

export const PRICING: Record<
  string,
  { amount: number; currency: string; name: string; description: string }
> = {
  pro_monthly: {
    amount: 99900,
    currency: "INR",
    name: "TalentOS Pro Monthly",
    description: "Unlimited interviews, premium AI analysis, job discovery",
  },
  pro_yearly: {
    amount: 799900,
    currency: "INR",
    name: "TalentOS Pro Yearly",
    description: "Best value - 2 months free!",
  },
  credits_10: {
    amount: 29900,
    currency: "INR",
    name: "10 Credits Pack",
    description: "10 additional analysis credits",
  },
  pro_trial: {
    amount: 100,
    currency: "INR",
    name: "Pro Trial",
    description: "Try TalentOS Pro for just ₹1",
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
      credits: 3,
      isSubscribed: false,
      passwordHash: "guest_account_no_password",
      },
    });
    return doc;
  }

  return null;
}
