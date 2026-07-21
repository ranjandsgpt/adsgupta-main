'use client';

import { useState, type ReactNode } from 'react';
import { useIdentityAuth } from './AuthProvider';
import { LoginPanel } from './LoginPanel';

export function IdentityGate({
  children,
  appName = 'AdsGupta',
  theme = 'light',
  allowSkip = false,
}: {
  children: ReactNode;
  appName?: string;
  theme?: 'light' | 'dark';
  allowSkip?: boolean;
}) {
  const { user, loading, signOut } = useIdentityAuth();
  const [skipped, setSkipped] = useState(false);

  if (loading) {
    return (
      <div className="identity-loading flex min-h-[50vh] items-center justify-center text-sm opacity-70">
        Checking sign-in…
      </div>
    );
  }

  if (user || skipped) {
    return (
      <div className="relative">
        {user ? (
          <div className="identity-chrome absolute right-4 top-3 z-50 flex items-center gap-3 text-xs">
            <span className="opacity-70">{user.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
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

  return (
    <LoginPanel
      appName={appName}
      theme={theme}
      allowSkip={allowSkip}
      onSkip={allowSkip ? () => setSkipped(true) : undefined}
    />
  );
}
