import type { DefaultSession } from "next-auth";

type ExchangeRole = "admin" | "publisher" | "advertiser" | "demand";
type AdminAccess = "admin" | "ops" | "viewer";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: ExchangeRole;
      publisherId?: string | null;
      publisherIds?: string[] | null;
      demandAdvertiser?: string | null;
      campaignEmail?: string | null;
      adminAccess?: AdminAccess | null;
    };
  }

  interface User {
    role: ExchangeRole;
    publisherId?: string | null;
    publisherIds?: string[] | null;
    demandAdvertiser?: string | null;
    campaignEmail?: string | null;
    adminAccess?: AdminAccess | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: ExchangeRole;
    publisherId?: string | null;
    publisherIds?: string[] | null;
    demandAdvertiser?: string | null;
    campaignEmail?: string | null;
    adminAccess?: AdminAccess | null;
  }
}
