import { authOptions } from "@/lib/auth-options";
import type { AuthContext } from "@/lib/require-auth";
import { getServerSession } from "next-auth/next";

export async function getAuthContextFromSession(): Promise<AuthContext | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role) return null;
    return {
      role: session.user.role,
      publisherId: session.user.publisherId ?? null,
      demandAdvertiser: session.user.demandAdvertiser ?? null
    };
  } catch (err) {
    console.error("[exchange] getServerSession failed:", err);
    return null;
  }
}
