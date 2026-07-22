import type { ExchangeRole } from "@/lib/roles";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  createAuthOptions,
  getAppRoleForEmail,
  getSessionTokenCookieName,
  getAuthCookieDomain,
} from "@adsgupta/auth";

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
  const adminAccess = (process.env[`EXCHANGE_ADMIN_${i}_ROLE`] ?? "admin") as
    | "admin"
    | "ops"
    | "viewer";
  if (email && password) {
    adminUsers.push({ email, password, adminAccess });
  }
}

if (process.env.EXCHANGE_ADMIN_EMAIL && process.env.EXCHANGE_ADMIN_PASSWORD) {
  adminUsers.push({
    email: process.env.EXCHANGE_ADMIN_EMAIL,
    password: process.env.EXCHANGE_ADMIN_PASSWORD,
    adminAccess: "admin",
  });
}

if (process.env.EXCHANGE_OPS_EMAIL && process.env.EXCHANGE_OPS_PASSWORD) {
  adminUsers.push({
    email: process.env.EXCHANGE_OPS_EMAIL,
    password: process.env.EXCHANGE_OPS_PASSWORD,
    adminAccess: "viewer",
  });
}

async function matchFromCentralRoles(email: string): Promise<UserRecord | null> {
  try {
    const appRole = await getAppRoleForEmail(email, "exchange");
    if (!appRole || appRole.status !== "active") return null;
    const role = appRole.role as ExchangeRole;
    if (!["admin", "publisher", "advertiser", "demand"].includes(role)) return null;
    const publisherIds = Array.isArray(appRole.meta.publisher_ids)
      ? appRole.meta.publisher_ids.map(String)
      : null;
    return {
      id: appRole.userId,
      email,
      role,
      publisherIds,
      publisherId: publisherIds?.[0] ?? null,
      campaignEmail:
        typeof appRole.meta.campaign_email === "string" ? appRole.meta.campaign_email : null,
      demandAdvertiser: role === "advertiser" ? email.split("@")[0] : null,
      adminAccess: role === "admin" ? "admin" : undefined,
    };
  } catch {
    return null;
  }
}

async function matchUser(
  email: string | undefined,
  password: string | undefined
): Promise<UserRecord | null> {
  if (!email || password === undefined) return null;
  const normalizedEmail = email.trim().toLowerCase();

  for (const u of adminUsers) {
    if (normalizedEmail === u.email.trim().toLowerCase() && password === u.password) {
      return {
        id: "admin",
        email: normalizedEmail,
        role: "admin",
        adminAccess: u.adminAccess,
      };
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
        : null,
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
      campaignEmail: process.env.EXCHANGE_DEMAND_EMAIL?.trim().toLowerCase() || null,
    };
  }

  // Prefer central user_app_roles when password matches central/platform hash
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
  if (row?.status === "active" && row.password_hash) {
    const ok = await bcrypt.compare(password, row.password_hash);
    if (ok) {
      const central = await matchFromCentralRoles(normalizedEmail);
      if (central) return { ...central, name: row.name };

      const role =
        row.role === "advertiser"
          ? "advertiser"
          : row.role === "publisher"
            ? "publisher"
            : row.role === "admin"
              ? "admin"
              : null;
      if (role) {
        return {
          id: row.id,
          email: row.email,
          name: row.name,
          role,
          publisherIds: row.publisher_ids ?? null,
          publisherId: row.publisher_ids?.[0] ?? null,
          campaignEmail: row.campaign_email,
          demandAdvertiser: role === "advertiser" ? row.name : null,
          adminAccess: role === "admin" ? "admin" : undefined,
        };
      }
    }
  }

  return null;
}

const shared = createAuthOptions({
  appUrl: process.env.NEXTAUTH_URL || "https://exchange.adsgupta.com",
  cookieDomain: getAuthCookieDomain() || ".adsgupta.com",
});

export const authOptions: NextAuthOptions = {
  ...shared,
  secret: process.env.NEXTAUTH_SECRET || shared.secret,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
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
          adminAccess: record.adminAccess,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Shared hub session: enrich exchange role from user_app_roles when missing
      if (!user && token.email && !token.role) {
        const central = await matchFromCentralRoles(String(token.email));
        if (central) {
          token.role = central.role;
          token.publisherId = central.publisherId ?? null;
          token.publisherIds = central.publisherIds ?? null;
          token.demandAdvertiser = central.demandAdvertiser ?? null;
          token.campaignEmail = central.campaignEmail ?? null;
          token.adminAccess = central.adminAccess ?? null;
          token.id = central.id;
        }
      }

      if (user && "role" in user) {
        token.role = user.role as ExchangeRole;
        token.publisherId = user.publisherId ?? null;
        token.publisherIds =
          (user as unknown as { publisherIds?: string[] | null }).publisherIds ?? null;
        token.demandAdvertiser = user.demandAdvertiser ?? null;
        token.campaignEmail =
          (user as unknown as { campaignEmail?: string | null }).campaignEmail ?? null;
        token.adminAccess =
          (user as unknown as { adminAccess?: UserRecord["adminAccess"] }).adminAccess ?? null;
      }

      // Prefer token.exchangeRole from shared JWT if present
      if (!token.role && token.exchangeRole) {
        token.role = token.exchangeRole as ExchangeRole;
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
        session.user.campaignEmail =
          (token.campaignEmail as string | null | undefined) ?? null;
        (session.user as { adminAccess?: UserRecord["adminAccess"] | null }).adminAccess =
          (token.adminAccess as UserRecord["adminAccess"] | null | undefined) ?? null;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: getSessionTokenCookieName(process.env.NEXTAUTH_URL),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getAuthCookieDomain() || ".adsgupta.com",
      },
    },
  },
};
