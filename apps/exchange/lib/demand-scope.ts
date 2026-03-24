import type { AuthContext } from "@/lib/require-auth";

/** When set, demand users only see/edit this advertiser; when null, all campaigns. */
export function demandAdvertiserFilter(auth: AuthContext): string | null {
  if (auth.role !== "demand") return null;
  return auth.demandAdvertiser;
}
