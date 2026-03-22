import type { Db } from "mongodb";
import { generateId } from "./ids";

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

export async function ensureUserForPayment(db: Db, userId: string): Promise<Record<string, unknown> | null> {
  const existing = await db.collection("users").findOne({ user_id: userId }, { projection: { _id: 0 } });
  if (existing) return existing as Record<string, unknown>;

  if (userId.startsWith("guest_")) {
    const now = new Date().toISOString();
    const doc = {
      user_id: userId,
      email: `${userId}@guest.talentos.local`,
      name: "Guest",
      auth_provider: "guest",
      credits: 3,
      is_pro: false,
      picture: null,
      created_at: now,
      updated_at: now,
    };
    await db.collection("users").insertOne(doc);
    return doc;
  }

  return null;
}
