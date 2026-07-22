'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';

type Mode = 'signin' | 'register' | 'forgot' | 'reset';

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function getAuthApiBase(): string {
  return process.env.NEXT_PUBLIC_AUTH_API_BASE || '/api/auth';
}

export function AuthGate({
  children,
  appName = 'AdsGupta',
  theme = 'light',
  allowSkip = false,
}: {
  children: ReactNode;
  appName?: string;
  theme?: 'light' | 'dark';
  /** When true, show a "Continue without account" escape hatch */
  allowSkip?: boolean;
}) {
  const { data: session, status } = useSession();
  const [skipped, setSkipped] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm opacity-70">
        Checking sign-in…
      </div>
    );
  }

  if (session?.user || skipped) {
    return (
      <div className="relative">
        {session?.user ? (
          <div className="absolute right-4 top-3 z-50 flex items-center gap-3 text-xs">
            <span className="opacity-70">{session.user.email}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: typeof window !== 'undefined' ? window.location.pathname : '/' })}
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
    <AuthPanel
      appName={appName}
      theme={theme}
      allowSkip={allowSkip}
      onSkip={allowSkip ? () => setSkipped(true) : undefined}
    />
  );
}

export function AuthPanel({
  appName = 'AdsGupta',
  theme = 'light',
  allowSkip,
  onSkip,
  initialMode,
}: {
  appName?: string;
  theme?: 'light' | 'dark';
  allowSkip?: boolean;
  onSkip?: () => void;
  initialMode?: Mode;
}) {
  const searchMode = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'reset' || mode === 'register' || mode === 'forgot' || mode === 'signin') {
      return mode as Mode;
    }
    return null;
  }, []);

  const [mode, setMode] = useState<Mode>(initialMode || searchMode || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
      setMode('reset');
    }
  }, []);

  const dark = theme === 'dark';
  const shell = classNames(
    'mx-auto w-full max-w-md rounded-2xl border p-6 shadow-sm',
    dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
  );
  const input = classNames(
    'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400',
    dark ? 'border-white/15 bg-black/30 text-white' : 'border-gray-200 bg-white text-gray-900'
  );
  const label = 'block text-sm font-medium opacity-80';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (res?.error) {
          setError('Invalid email or password');
          return;
        }
        window.location.reload();
        return;
      }

      if (mode === 'register') {
        if (password !== confirm) {
          setError('Passwords do not match');
          return;
        }
        const res = await fetch(`${getAuthApiBase()}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Registration failed');
          return;
        }
        const login = await signIn('credentials', { email, password, redirect: false });
        if (login?.error) {
          setInfo('Account created. Please sign in.');
          setMode('signin');
          return;
        }
        window.location.reload();
        return;
      }

      if (mode === 'forgot') {
        const res = await fetch(`${getAuthApiBase()}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            appUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Request failed');
          return;
        }
        setInfo(data.message || 'Check your email for a reset link.');
        if (data.resetUrl && process.env.NODE_ENV !== 'production') {
          setInfo(`${data.message} Dev reset link: ${data.resetUrl}`);
        }
        return;
      }

      if (mode === 'reset') {
        if (password !== confirm) {
          setError('Passwords do not match');
          return;
        }
        const res = await fetch(`${getAuthApiBase()}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Reset failed');
          return;
        }
        setInfo(data.message || 'Password updated.');
        setMode('signin');
        setPassword('');
        setConfirm('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className={shell}>
        <h1 className="text-xl font-semibold tracking-tight">{appName}</h1>
        <p className="mt-1 text-sm opacity-70">
          {mode === 'signin' && 'Sign in to continue'}
          {mode === 'register' && 'Create your AdsGupta account'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'reset' && 'Choose a new password'}
        </p>

        {googleEnabled && (mode === 'signin' || mode === 'register') ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.href : '/' })}
            className={classNames(
              'mt-5 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium',
              dark
                ? 'border-white/15 bg-white/10 hover:bg-white/15'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        ) : null}

        {(mode === 'signin' || mode === 'register') && (
          <div className="my-4 flex items-center gap-3 text-xs opacity-50">
            <div className="h-px flex-1 bg-current opacity-30" />
            or
            <div className="h-px flex-1 bg-current opacity-30" />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'register' ? (
            <label className="block">
              <span className={label}>Name</span>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          ) : null}

          {mode !== 'reset' ? (
            <label className="block">
              <span className={label}>Email</span>
              <input
                className={input}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
          ) : null}

          {mode === 'signin' || mode === 'register' || mode === 'reset' ? (
            <label className="block">
              <span className={label}>Password</span>
              <input
                className={input}
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </label>
          ) : null}

          {mode === 'register' || mode === 'reset' ? (
            <label className="block">
              <span className={label}>Confirm password</span>
              <input
                className={input}
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {info ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'register'
                  ? 'Create account'
                  : mode === 'forgot'
                    ? 'Send reset link'
                    : 'Update password'}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          {mode === 'signin' ? (
            <>
              <button type="button" className="block w-full opacity-70 hover:opacity-100" onClick={() => setMode('forgot')}>
                Forgot password?
              </button>
              <button type="button" className="block w-full opacity-70 hover:opacity-100" onClick={() => setMode('register')}>
                New here? Create an account
              </button>
            </>
          ) : null}
          {mode === 'register' || mode === 'forgot' || mode === 'reset' ? (
            <button type="button" className="block w-full opacity-70 hover:opacity-100" onClick={() => setMode('signin')}>
              Back to sign in
            </button>
          ) : null}
          {allowSkip && onSkip ? (
            <button type="button" className="mt-2 block w-full text-xs opacity-50 hover:opacity-80" onClick={onSkip}>
              Continue without account
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.1C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.5-6.5 6.7l6.2 5.1C38.7 37.1 44 31.5 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}
