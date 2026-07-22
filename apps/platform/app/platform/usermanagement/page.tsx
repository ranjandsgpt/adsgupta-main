'use client';

import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  AuthPanel,
  AuthSessionProvider,
  PlatformAdminConsole,
  getPlatformHubUrl,
} from '@adsgupta/auth';
import '@adsgupta/auth/styles.css';

function UserManagementInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const hubUrl = getPlatformHubUrl();
  const modeParam = searchParams.get('mode');
  const initialMode =
    modeParam === 'register' || modeParam === 'forgot'
      ? modeParam
      : modeParam === 'free' || modeParam === 'trial'
        ? 'register'
        : 'signin';

  // Admins open the console from the hub via ?view=admin
  const stayOnConsole = searchParams.get('view') === 'admin';

  useEffect(() => {
    if (status !== 'authenticated') {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    fetch('/platform/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { isAdmin?: boolean }) => {
        if (cancelled) return;
        setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.email]);

  useEffect(() => {
    if (status !== 'authenticated' || isAdmin === null) return;
    if (isAdmin && stayOnConsole) return;
    window.location.replace(hubUrl);
  }, [status, isAdmin, stayOnConsole, hubUrl]);

  if (status === 'loading' || (status === 'authenticated' && isAdmin === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-sm font-semibold text-gray-900">AdsGupta Platform</p>
          <p className="text-xs text-gray-500">
            One account across marketplace, exchange, blog, and TalentOS
          </p>
        </header>
        <AuthPanel
          appName="AdsGupta"
          theme="light"
          initialMode={initialMode}
          successRedirectUrl={hubUrl}
        />
      </main>
    );
  }

  if (!isAdmin || !stayOnConsole) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Taking you to your tools…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">AdsGupta User Management</p>
            <p className="text-xs text-gray-500">Signed in as {session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={hubUrl} className="text-sm text-sky-600 hover:underline">
              Back to tools
            </a>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/platform/usermanagement' })}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <PlatformAdminConsole />
    </main>
  );
}

export default function UserManagementPage() {
  return (
    <AuthSessionProvider basePath="/platform/api/auth">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
            Loading…
          </div>
        }
      >
        <UserManagementInner />
      </Suspense>
    </AuthSessionProvider>
  );
}
