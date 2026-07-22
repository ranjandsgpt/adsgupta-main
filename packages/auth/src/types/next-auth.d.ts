import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      subdomain?: string;
      appRoles?: Array<{
        appSlug: string;
        role: string;
        status: string;
        meta?: Record<string, unknown>;
      }>;
      exchangeRole?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    subdomain?: string;
    exchangeRole?: string;
    publisherId?: string | null;
    publisherIds?: string[] | null;
    campaignEmail?: string | null;
    demandAdvertiser?: string | null;
    adminAccess?: string | null;
    appRoles?: Array<{
      appSlug: string;
      role: string;
      status: string;
      meta?: Record<string, unknown>;
    }>;
  }
}

export {};
