'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState, type ReactNode } from 'react';
import { buildPlatformAuthUrl } from '../lib/platform-auth-url';

/**
 * Gate that sends unauthenticated users to adsgupta.com/platform/usermanagement.
 * Authenticated users see children (with optional sign-out chrome).
 */
export function CentralAuthGate({
  children,
  allowSkip = false,
  mode,
}: {
  children: ReactNode;
  allowSkip?: boolean;
  mode?: 'signin' | 'register' | 'free' | 'trial';
}) {
  const { data: session, status } = useSession();
  const [skipped, setSkipped] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading' || session?.user || skipped || allowSkip) return;
    setRedirecting(true);
    const returnTo =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://marketplace.adsgupta.com/audit';
    window.location.replace(buildPlatformAuthUrl({ returnTo, mode }));
  }, [status, session, skipped, mode, allowSkip]);

  if (status === 'loading' || redirecting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm opacity-70">
        {redirecting ? 'Redirecting to sign in…' : 'Checking sign-in…'}
      </div>
    );
  }

  if (!session?.user && !skipped) {
    if (allowSkip) {
      const returnTo =
        typeof window !== 'undefined'
          ? window.location.href
          : 'https://marketplace.adsgupta.com/audit';
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-sm opacity-70">Sign in to use this tool</p>
          <a
            href={buildPlatformAuthUrl({ returnTo })}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in with AdsGupta
          </a>
          <button
            type="button"
            className="text-xs opacity-50 hover:opacity-80"
            onClick={() => setSkipped(true)}
          >
            Continue without account
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative">
      {session?.user ? (
        <div className="absolute right-4 top-3 z-50 flex items-center gap-3 text-xs">
          <span className="opacity-70">{session.user.email}</span>
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl:
                  typeof window !== 'undefined' ? window.location.pathname : '/',
              })
            }
            className="underline opacity-80 hover:opacity-100"
          >
            Sign out
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** @deprecated Use CentralAuthGate */
export function CentralAuthRedirect(props: { mode?: 'signin' | 'register' | 'free' | 'trial' }) {
  useEffect(() => {
    const returnTo =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://marketplace.adsgupta.com/audit';
    window.location.replace(buildPlatformAuthUrl({ returnTo, mode: props.mode }));
  }, [props.mode]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      Redirecting to sign in…
    </div>
  );
}
