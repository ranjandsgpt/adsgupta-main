import type { ExchangeRole } from "@/lib/roles";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type UserRecord = {
  id: string;
  email: string;
  role: ExchangeRole;
  publisherId?: string | null;
  demandAdvertiser?: string | null;
  adminAccess?: "admin" | "ops" | "viewer";
};

const adminUsers: Array<{
  email: string;
  password: string;
  adminAccess: "admin" | "ops" | "viewer";
}> = [];

for (let i = 1; i <= 5; i++) {
  const email = process.env[`EXCHANGE_ADMIN_${i}_EMAIL`];
  const password = process.env[`EXCHANGE_ADMIN_${i}_PASSWORD`];
  const adminAccess = (process.env[`EXCHANGE_ADMIN_${i}_ROLE`] ?? "admin") as "admin" | "ops" | "viewer";
  if (email && password) {
    adminUsers.push({ email, password, adminAccess });
  }
}

// Back-compat for legacy single admin env vars.
if (process.env.EXCHANGE_ADMIN_EMAIL && process.env.EXCHANGE_ADMIN_PASSWORD) {
  adminUsers.push({
    email: process.env.EXCHANGE_ADMIN_EMAIL,
    password: process.env.EXCHANGE_ADMIN_PASSWORD,
    adminAccess: "admin"
  });
}

// Ops user: treated as read-only for all privileged UI actions.
if (process.env.EXCHANGE_OPS_EMAIL && process.env.EXCHANGE_OPS_PASSWORD) {
  adminUsers.push({
    email: process.env.EXCHANGE_OPS_EMAIL,
    password: process.env.EXCHANGE_OPS_PASSWORD,
    adminAccess: "viewer"
  });
}

function matchUser(email: string | undefined, password: string | undefined): UserRecord | null {
  if (!email || password === undefined) return null;

  for (const u of adminUsers) {
    if (email === u.email && password === u.password) {
      return { id: "admin", email, role: "admin", adminAccess: u.adminAccess };
    }
  }

  if (
    email === process.env.EXCHANGE_PUBLISHER_EMAIL &&
    password === process.env.EXCHANGE_PUBLISHER_PASSWORD
  ) {
    return {
      id: "publisher",
      email,
      role: "publisher",
      publisherId: process.env.EXCHANGE_PUBLISHER_ID?.trim() || null
    };
  }

  if (
    email === process.env.EXCHANGE_DEMAND_EMAIL &&
    password === process.env.EXCHANGE_DEMAND_PASSWORD
  ) {
    return {
      id: "demand",
      email,
      role: "demand",
      demandAdvertiser: process.env.EXCHANGE_DEMAND_ADVERTISER?.trim() || null
    };
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const record = matchUser(credentials?.email, credentials?.password);
        if (!record) return null;
        return {
          id: record.id,
          email: record.email,
          role: record.role,
          publisherId: record.publisherId,
          demandAdvertiser: record.demandAdvertiser,
          adminAccess: record.adminAccess
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as ExchangeRole;
        token.publisherId = user.publisherId ?? null;
        token.demandAdvertiser = user.demandAdvertiser ?? null;
        token.adminAccess = (user as unknown as { adminAccess?: UserRecord["adminAccess"] }).adminAccess ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as ExchangeRole;
        session.user.publisherId = (token.publisherId as string | null | undefined) ?? null;
        session.user.demandAdvertiser =
          (token.demandAdvertiser as string | null | undefined) ?? null;
        (session.user as { adminAccess?: UserRecord["adminAccess"] | null }).adminAccess =
          (token.adminAccess as UserRecord["adminAccess"] | null | undefined) ?? null;
      }
      return session;
    }
  }
};
