import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { buildPlatformAuthUrl } from "@adsgupta/auth";

import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "AdsGupta — The Programmatic Advertising Platform",
  description: "Real-time auctions. Self-serve onboarding. Enterprise controls."
};

type SessionUserLike = {
  role?: string;
  exchangeRole?: string;
  publisherId?: string | null;
  publisherIds?: string[] | null;
  campaignEmail?: string | null;
  email?: string | null;
  appRoles?: Array<{ appSlug?: string; role?: string; status?: string }>;
};

function resolveExchangeRole(user?: SessionUserLike | null): string | null {
  if (!user) return null;
  const appRoles = user.appRoles || [];
  const exchange = appRoles.find(
    (r) => r.appSlug === "exchange" && r.status === "active" && r.role
  );
  if (exchange?.role) return exchange.role;
  if (user.exchangeRole) return user.exchangeRole;
  const platformAdmin = appRoles.find(
    (r) => r.appSlug === "platform" && r.role === "admin" && r.status === "active"
  );
  if (platformAdmin) return "admin";
  if (user.role === "admin") return "admin";
  return null;
}

function roleRedirect(session: { user?: SessionUserLike } | null): string | null {
  const role = resolveExchangeRole(session?.user);
  if (!role) return null;
  if (role === "admin") return "/platform";
  if (role === "publisher") {
    const ids = session?.user?.publisherIds ?? [];
    const id = ids?.[0] ?? session?.user?.publisherId ?? "";
    return id ? `/publisher/dashboard?id=${encodeURIComponent(id)}` : "/publisher/dashboard";
  }
  if (role === "advertiser" || role === "demand") {
    const email = session?.user?.campaignEmail ?? session?.user?.email ?? "";
    return email ? `/demand/dashboard?email=${encodeURIComponent(email)}` : "/demand/dashboard";
  }
  return null;
}

/**
 * No marketing homepage — signed-in users enter the exchange;
 * everyone else goes to central Sign In → adsgupta.com/platform hub.
 */
export default async function HomePage() {
  const session = (await getServerSession(authOptions)) as { user?: SessionUserLike } | null;
  const dest = roleRedirect(session);
  if (dest) redirect(dest);
  if (session?.user) {
    // Signed in but no exchange access — back to the tools hub
    redirect("https://adsgupta.com/platform");
  }
  redirect(buildPlatformAuthUrl());
}
