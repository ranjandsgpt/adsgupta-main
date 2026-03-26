import type { ExchangeRole } from "@/lib/roles";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type UserRecord = {
  id: string;
  email: string;
  role: ExchangeRole;
  name?: string | null;
  publisherId?: string | null;
  publisherIds?: string[] | null;
  demandAdvertiser?: string | null;
  campaignEmail?: string | null;
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

async function matchUser(email: string | undefined, password: string | undefined): Promise<UserRecord | null> {
  if (!email || password === undefined) return null;
  const normalizedEmail = email.trim().toLowerCase();

  for (const u of adminUsers) {
    if (normalizedEmail === u.email.trim().toLowerCase() && password === u.password) {
      return { id: "admin", email: normalizedEmail, role: "admin", adminAccess: u.adminAccess };
    }
  }

  if (
    normalizedEmail === process.env.EXCHANGE_PUBLISHER_EMAIL?.trim().toLowerCase() &&
    password === process.env.EXCHANGE_PUBLISHER_PASSWORD
  ) {
    return {
      id: "publisher",
      email: normalizedEmail,
      role: "publisher",
      publisherId: process.env.EXCHANGE_PUBLISHER_ID?.trim() || null,
      publisherIds: process.env.EXCHANGE_PUBLISHER_ID?.trim()
        ? [process.env.EXCHANGE_PUBLISHER_ID.trim()]
        : null
    };
  }

  if (
    normalizedEmail === process.env.EXCHANGE_DEMAND_EMAIL?.trim().toLowerCase() &&
    password === process.env.EXCHANGE_DEMAND_PASSWORD
  ) {
    return {
      id: "demand",
      email: normalizedEmail,
      role: "demand",
      demandAdvertiser: process.env.EXCHANGE_DEMAND_ADVERTISER?.trim() || null,
      campaignEmail: process.env.EXCHANGE_DEMAND_EMAIL?.trim().toLowerCase() || null
    };
  }

  type PlatformUserRow = {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    password_hash: string | null;
    publisher_ids: string[] | null;
    campaign_email: string | null;
  };

  const pu = await sql<PlatformUserRow>`
    SELECT
      id::text,
      email,
      name,
      role,
      status,
      password_hash,
      publisher_ids::text[] AS publisher_ids,
      campaign_email
    FROM platform_users
    WHERE lower(email) = ${normalizedEmail}
    LIMIT 1
  `;
  const row = pu.rows[0];
  if (!row || row.status !== "active" || !row.password_hash) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;

  const role = row.role === "advertiser" ? "advertiser" : row.role === "publisher" ? "publisher" : null;
  if (!role) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role,
    publisherIds: row.publisher_ids ?? null,
    publisherId: row.publisher_ids?.[0] ?? null,
    campaignEmail: row.campaign_email,
    demandAdvertiser: role === "advertiser" ? row.name : null
  };

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
        const record = await matchUser(credentials?.email, credentials?.password);
        if (!record) return null;
        return {
          id: record.id,
          email: record.email,
          name: record.name ?? undefined,
          role: record.role,
          publisherId: record.publisherId,
          publisherIds: record.publisherIds,
          demandAdvertiser: record.demandAdvertiser,
          campaignEmail: record.campaignEmail,
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
        token.publisherIds = (user as unknown as { publisherIds?: string[] | null }).publisherIds ?? null;
        token.demandAdvertiser = user.demandAdvertiser ?? null;
        token.campaignEmail = (user as unknown as { campaignEmail?: string | null }).campaignEmail ?? null;
        token.adminAccess = (user as unknown as { adminAccess?: UserRecord["adminAccess"] }).adminAccess ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as ExchangeRole;
        session.user.publisherId = (token.publisherId as string | null | undefined) ?? null;
        session.user.publisherIds = (token.publisherIds as string[] | null | undefined) ?? null;
        session.user.demandAdvertiser =
          (token.demandAdvertiser as string | null | undefined) ?? null;
        session.user.campaignEmail = (token.campaignEmail as string | null | undefined) ?? null;
        (session.user as { adminAccess?: UserRecord["adminAccess"] | null }).adminAccess =
          (token.adminAccess as UserRecord["adminAccess"] | null | undefined) ?? null;
      }
      return session;
    }
  }
};
