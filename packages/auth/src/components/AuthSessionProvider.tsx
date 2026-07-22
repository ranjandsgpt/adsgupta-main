'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function AuthSessionProvider({
  children,
  basePath,
}: {
  children: ReactNode;
  /** e.g. `/platform/api/auth` on adsgupta.com central login */
  basePath?: string;
}) {
  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
