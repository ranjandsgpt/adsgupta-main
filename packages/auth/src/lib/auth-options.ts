import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { matchEnvAdmin } from './env-admins';
import {
  isLegacyBcryptHash,
  toStoredPassword,
  verifyStoredPassword,
} from './password';
import { findUserByEmail, upsertOAuthUser, upsertPasswordUser } from './users';
import { getRolesForEmail, getAppRoleForEmail, seedEnvAdminsToRoles } from './roles';
import {
  getAuthCookieDomain,
  getSessionTokenCookieName,
  useSecureAuthCookies,
} from './session-cookie';

type AuthUserRole = 'admin' | 'publisher' | 'advertiser' | 'demand';

function authUserFromCentral(
  user: { id: string; email: string; name: string | null; image: string | null },
  role: AuthUserRole = 'advertiser'
) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role,
  };
}

export type CreateAuthOptionsInput = {
  /** Public app origin, e.g. https://marketplace.adsgupta.com */
  appUrl?: string;
  /** Cookie domain for cross-subdomain SSO, e.g. .adsgupta.com */
  cookieDomain?: string;
};

export function createAuthOptions(input: CreateAuthOptionsInput = {}): NextAuthOptions {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.warn('[adsgupta/auth] NEXTAUTH_SECRET is not set');
  }

  const providers: NextAuthOptions['providers'] = [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        // Ensure role tables / env admin seeds exist before first login
        try {
          await seedEnvAdminsToRoles();
        } catch {
          // non-fatal
        }

        // 1) central_users / Exchange platform_users (plaintext for now; bcrypt legacy ok)
        const user = await findUserByEmail(email);
        if (user?.passwordHash) {
          const ok = await verifyStoredPassword(password, user.passwordHash);
          if (ok) {
            // Rewrite legacy bcrypt rows to plaintext so they are visible in Supabase
            if (isLegacyBcryptHash(user.passwordHash)) {
              await upsertPasswordUser({
                email,
                passwordHash: toStoredPassword(password),
                name: user.name,
              });
            }
            const platformRole = await getAppRoleForEmail(email, 'platform');
            const role: AuthUserRole =
              platformRole?.role === 'admin' ? 'admin' : 'advertiser';
            return authUserFromCentral(user, role);
          }
        }

        // 2) Blog-style env admins (ADMIN_USER_* plaintext) — same creds as blog.adsgupta.com
        const envAdmin = matchEnvAdmin(email, password);
        if (!envAdmin) return null;

        const stored = await upsertPasswordUser({
          email: envAdmin.email,
          passwordHash: toStoredPassword(password),
          name: envAdmin.name,
        });
        try {
          await seedEnvAdminsToRoles();
        } catch {
          // non-fatal
        }

        return authUserFromCentral(stored, 'admin');
      },
    }),
  ];
  const googleId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;
  if (googleId && googleSecret) {
    providers.unshift(
      GoogleProvider({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  const cookieDomain = getAuthCookieDomain(input.cookieDomain);
  const useSecureCookies = useSecureAuthCookies(input.appUrl);
  const sessionToken = getSessionTokenCookieName(input.appUrl);

  return {
    secret,
    providers,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider === 'google' && user.email) {
          await upsertOAuthUser({
            email: user.email,
            name: user.name,
            image: user.image,
          });
        }
        return true;
      },
      async jwt({ token, user, account }) {
        if (user?.id) {
          token.id = user.id;
          if ('role' in user && user.role) {
            token.role = user.role as AuthUserRole;
          }
        } else if (account?.provider === 'google' && token.email) {
          const stored = await upsertOAuthUser({
            email: String(token.email),
            name: token.name ? String(token.name) : null,
            image: token.picture ? String(token.picture) : null,
          });
          token.id = stored.id;
        }

        // Attach app roles + blog subdomain for downstream hosts (blog/exchange)
        if (token.email) {
          try {
            const roles = await getRolesForEmail(String(token.email));
            token.appRoles = roles.map((r) => ({
              appSlug: r.appSlug,
              role: r.role,
              status: r.status,
              meta: r.meta,
            }));
            const blog = roles.find((r) => r.appSlug === 'blog' && r.status === 'active');
            if (blog?.meta && typeof blog.meta.subdomain === 'string') {
              token.subdomain = blog.meta.subdomain;
            }
            const exchange = roles.find(
              (r) => r.appSlug === 'exchange' && r.status === 'active'
            );
            if (exchange) {
              token.exchangeRole = exchange.role;
              if (Array.isArray(exchange.meta.publisher_ids)) {
                token.publisherIds = exchange.meta.publisher_ids.map(String);
                token.publisherId = String(exchange.meta.publisher_ids[0] || '') || null;
              }
              if (typeof exchange.meta.campaign_email === 'string') {
                token.campaignEmail = exchange.meta.campaign_email;
              }
            }
          } catch {
            // roles optional during bootstrap
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          (session.user as { id?: string }).id = String(token.id);
          if (token.role) {
            (session.user as { role?: AuthUserRole }).role = token.role as AuthUserRole;
          }
          if (token.subdomain) {
            (session.user as { subdomain?: string }).subdomain = String(token.subdomain);
          }
          if (token.appRoles) {
            (session.user as { appRoles?: unknown }).appRoles = token.appRoles;
          }
          if (token.exchangeRole) {
            (session.user as { exchangeRole?: string }).exchangeRole = String(
              token.exchangeRole
            );
          }
        }
        return session;
      },
    },
    cookies: cookieDomain
      ? {
          sessionToken: {
            name: sessionToken,
            options: {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              secure: useSecureCookies,
              domain: cookieDomain,
            },
          },
        }
      : {
          sessionToken: {
            name: sessionToken,
            options: {
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
              secure: useSecureCookies,
            },
          },
        },
  };
}
