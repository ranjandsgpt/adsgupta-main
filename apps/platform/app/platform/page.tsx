'use client';

import { useSession, signOut } from 'next-auth/react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  AuthSessionProvider,
  PLATFORM_AUTH_PATH,
  buildPlatformAuthUrl,
  normalizeAppSlug,
} from '@adsgupta/auth';
import '@adsgupta/auth/styles.css';

type AppRole = {
  appSlug: string;
  role: string;
  status: string;
};

type ToolCard = {
  slug: 'exchange' | 'marketplace' | 'blog' | 'talentos';
  name: string;
  description: string;
  href: string;
};

const TOOLS: ToolCard[] = [
  {
    slug: 'exchange',
    name: 'Exchange',
    description: 'AdsGupta — The Programmatic Advertising Platform.',
    href: 'https://exchange.adsgupta.com',
  },
  {
    slug: 'marketplace',
    name: 'Marketplace',
    description: 'Amazon intelligence tools — audits, ROAS, and catalog insights.',
    href: 'https://marketplace.adsgupta.com/#tools',
  },
  {
    slug: 'blog',
    name: 'Blog',
    description: 'AdsGupta Archives — product stories and industry writing.',
    href: 'https://blog.adsgupta.com',
  },
  {
    slug: 'talentos',
    name: 'TalentOS',
    description: 'Career and interview intelligence for ad-tech talent.',
    href: 'https://talentos.adsgupta.com',
  },
];

function PlatformHubInner() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [appRoles, setAppRoles] = useState<AppRole[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.replace(buildPlatformAuthUrl());
      return;
    }
    if (status !== 'authenticated') return;

    let cancelled = false;
    fetch('/platform/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then(
        (data: {
          isAdmin?: boolean;
          appRoles?: AppRole[];
          authenticated?: boolean;
        }) => {
          if (cancelled) return;
          if (!data.authenticated) {
            window.location.replace(buildPlatformAuthUrl());
            return;
          }
          setIsAdmin(Boolean(data.isAdmin));
          setAppRoles(Array.isArray(data.appRoles) ? data.appRoles : []);
          setLoaded(true);
        }
      )
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const visibleTools = useMemo(() => {
    if (isAdmin) return TOOLS;
    const active = new Set(
      appRoles
        .filter((r) => r.status === 'active')
        .map((r) => normalizeAppSlug(r.appSlug) || r.appSlug)
    );
    return TOOLS.filter((t) => active.has(t.slug));
  }, [appRoles, isAdmin]);

  if (status === 'loading' || (status === 'authenticated' && !loaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">AdsGupta Platform</p>
            <p className="text-xs text-gray-500">Signed in as {session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <a
                href={`${PLATFORM_AUTH_PATH}?view=admin`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                User Management
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: PLATFORM_AUTH_PATH })}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Your tools</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Choose a product below. Access is based on the apps assigned to your account.
        </p>

        {visibleTools.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {visibleTools.map((tool) => (
              <li key={tool.slug}>
                <a
                  href={tool.href}
                  className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
                >
                  <p className="text-lg font-semibold text-gray-900">{tool.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
                  <p className="mt-4 text-sm font-medium text-sky-700">Open →</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-600">
            No tools are assigned to your account yet. Contact an AdsGupta admin to get access.
          </div>
        )}
      </section>
    </main>
  );
}

export default function PlatformHubPage() {
  return (
    <AuthSessionProvider basePath="/platform/api/auth">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
            Loading…
          </div>
        }
      >
        <PlatformHubInner />
      </Suspense>
    </AuthSessionProvider>
  );
}
