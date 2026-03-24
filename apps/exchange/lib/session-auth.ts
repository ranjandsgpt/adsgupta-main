import { authOptions } from "@/lib/auth-options";
import type { AuthContext } from "@/lib/require-auth";
import { getServerSession } from "next-auth";

export async function getAuthContextFromSession(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) return null;
  return {
    role: session.user.role,
    publisherId: session.user.publisherId ?? null,
    demandAdvertiser: session.user.demandAdvertiser ?? null
  };
}
