import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { matchEnvAdmin } from './env-admins';
import { findUserByEmail, upsertOAuthUser, upsertPasswordUser } from './users';

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

        // 1) central_users / Exchange platform_users (bcrypt)
        const user = await findUserByEmail(email);
        if (user?.passwordHash) {
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (ok) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
        }

        // 2) Blog-style env admins (ADMIN_USER_* plaintext) — same creds as blog.adsgupta.com
        const envAdmin = matchEnvAdmin(email, password);
        if (!envAdmin) return null;

        const passwordHash = await bcrypt.hash(password, 12);
        const stored = await upsertPasswordUser({
          email: envAdmin.email,
          passwordHash,
          name: envAdmin.name,
        });

        return {
          id: stored.id,
          email: stored.email,
          name: stored.name,
          image: stored.image,
        };
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

  const cookieDomain =
    input.cookieDomain ||
    process.env.AUTH_COOKIE_DOMAIN ||
    (process.env.NODE_ENV === 'production' ? '.adsgupta.com' : undefined);

  const useSecureCookies = Boolean(
    (input.appUrl || process.env.NEXTAUTH_URL || '').startsWith('https://') ||
      process.env.NODE_ENV === 'production'
  );

  const cookiePrefix = useSecureCookies ? '__Secure-' : '';
  const sessionToken = `${cookiePrefix}adsgupta.session-token`;

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
        } else if (account?.provider === 'google' && token.email) {
          const stored = await upsertOAuthUser({
            email: String(token.email),
            name: token.name ? String(token.name) : null,
            image: token.picture ? String(token.picture) : null,
          });
          token.id = stored.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          (session.user as { id?: string }).id = String(token.id);
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
      : undefined,
  };
}
