import { prisma } from "./prisma";
import { PLANS } from "./plans";

export type CreditAction = "analysis" | "interview" | "prep_guide" | "smart_recommendations" | "company_intel";
export const GUEST_FREE_ANALYSES = 5;

type CreditCheckResult =
  | { allowed: true; subscribed: boolean }
  | { allowed: false; error: "upgrade_required"; plan: "pro"; message: string };

async function ensureUserRecord(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;
  if (userId.startsWith("guest_")) {
    return prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@guest.talentos.local`,
        name: "Guest",
        passwordHash: "guest_account_no_password",
        credits: GUEST_FREE_ANALYSES,
        isSubscribed: false,
      },
    });
  }
  return null;
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const user = await ensureUserRecord(userId);
  return Boolean(user?.isSubscribed);
}

export async function checkCredits(userId: string, action: CreditAction): Promise<CreditCheckResult> {
  const user = await ensureUserRecord(userId);
  if (!user) {
    return { allowed: false, error: "upgrade_required", plan: "pro", message: "Please sign in to continue." };
  }

  if (user.isSubscribed) return { allowed: true, subscribed: true };

  if (action === "analysis") {
    if ((user.credits ?? 0) > 0) return { allowed: true, subscribed: false };
    return {
      allowed: false,
      error: "upgrade_required",
      plan: "pro",
      message: "You have used all free analyses. Upgrade to Pro for unlimited analyses.",
    };
  }

  if (action === "interview") {
    const interviewCount = await prisma.interview.count({ where: { userId } });
    if (interviewCount < PLANS.free.limits.interviews) return { allowed: true, subscribed: false };
    return {
      allowed: false,
      error: "upgrade_required",
      plan: "pro",
      message: "Free plan includes 1 mock interview. Upgrade to Pro for unlimited interviews.",
    };
  }

  return {
    allowed: false,
    error: "upgrade_required",
    plan: "pro",
    message: "This feature requires TalentOS Pro.",
  };
}

export async function deductCredit(userId: string, action: CreditAction): Promise<void> {
  const user = await ensureUserRecord(userId);
  if (!user || user.isSubscribed) return;
  if (action === "analysis" && (user.credits ?? 0) > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });
  }
}
