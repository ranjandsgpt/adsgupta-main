'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import {
  AuthPanel,
  AuthSessionProvider,
  PlatformAdminConsole,
  isPlatformAdminEmail,
  sanitizeReturnTo,
} from '@adsgupta/auth';
import '@adsgupta/auth/styles.css';

function UserManagementInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnTo = sanitizeReturnTo(
    searchParams.get('returnTo'),
    'https://adsgupta.com'
  );
  const modeParam = searchParams.get('mode');
  const initialMode =
    modeParam === 'register' || modeParam === 'forgot' ? modeParam : 'signin';

  const isAdmin =
    status === 'authenticated' &&
    isPlatformAdminEmail(session?.user?.email ?? null);

  useEffect(() => {
    if (status !== 'authenticated' || isAdmin) return;
    // Non-admin: bounce back to where they came from
    window.location.replace(returnTo);
  }, [status, isAdmin, returnTo]);

  if (status === 'loading') {
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
          <p className="text-xs text-gray-500">One account across marketplace, exchange, and blog</p>
        </header>
        <AuthPanel
          appName="AdsGupta"
          theme="light"
          initialMode={initialMode}
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Redirecting…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">AdsGupta Platform</p>
            <p className="text-xs text-gray-500">Signed in as {session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className="text-sm text-sky-600 hover:underline"
            >
              Back to app
            </button>
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
