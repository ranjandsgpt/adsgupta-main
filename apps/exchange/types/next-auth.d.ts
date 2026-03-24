import type { DefaultSession } from "next-auth";

type ExchangeRole = "admin" | "publisher" | "demand";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: ExchangeRole;
      publisherId?: string | null;
      demandAdvertiser?: string | null;
    };
  }

  interface User {
    role: ExchangeRole;
    publisherId?: string | null;
    demandAdvertiser?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: ExchangeRole;
    publisherId?: string | null;
    demandAdvertiser?: string | null;
  }
}
