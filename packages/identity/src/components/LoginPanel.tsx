'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { createBrowserClient } from '../lib/supabase/browser';
import type { MembershipTrack } from '../types';

type Mode = 'signin' | 'register' | 'forgot';

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export function LoginPanel({
  appName = 'AdsGupta',
  theme = 'light',
  allowSkip,
  onSkip,
  redirectTo,
}: {
  appName?: string;
  theme?: 'light' | 'dark';
  allowSkip?: boolean;
  onSkip?: () => void;
  redirectTo?: string;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [track, setTrack] = useState<MembershipTrack>('subscriber');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const freebieOn = process.env.NEXT_PUBLIC_FREEBIE_ENABLED === 'true';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'forgot') {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: `${origin}/api/auth/callback?next=/login` }
        );
        if (resetError) throw resetError;
        setMessage('Check your email for a password reset link.');
        return;
      }

      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() || null },
            emailRedirectTo:
              typeof window !== 'undefined'
                ? `${window.location.origin}/api/auth/callback`
                : undefined,
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ track }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error || 'Registration incomplete');
        } else {
          setMessage(
            'Account created. Confirm your email if required, then sign in and we will finish setup.'
          );
          setMode('signin');
          return;
        }

        if (redirectTo && typeof window !== 'undefined') {
          window.location.assign(redirectTo);
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw signInError;

      if (redirectTo && typeof window !== 'undefined') {
        window.location.assign(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  const dark = theme === 'dark';

  return (
    <div
      className={classNames(
        'identity-root flex min-h-[60vh] items-center justify-center px-4 py-12',
        dark && 'identity-theme-dark'
      )}
      data-identity-theme={theme}
    >
      <form
        onSubmit={onSubmit}
        className="identity-card w-full max-w-md space-y-4"
      >
        <div>
          <p className="identity-eyebrow">{appName}</p>
          <h1 className="identity-title">
            {mode === 'signin'
              ? 'Sign in'
              : mode === 'register'
                ? 'Create account'
                : 'Reset password'}
          </h1>
        </div>

        {mode === 'register' ? (
          <label className="identity-field">
            <span>Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="identity-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        {mode !== 'forgot' ? (
          <label className="identity-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
            />
          </label>
        ) : null}

        {mode === 'register' ? (
          <fieldset className="identity-track">
            <legend>Access track</legend>
            <label>
              <input
                type="radio"
                name="track"
                checked={track === 'subscriber'}
                onChange={() => setTrack('subscriber')}
              />
              Subscriber (pay ₹500 / 72h)
            </label>
            {freebieOn ? (
              <label>
                <input
                  type="radio"
                  name="track"
                  checked={track === 'freebie'}
                  onChange={() => setTrack('freebie')}
                />
                Freebie (admin approval)
              </label>
            ) : null}
          </fieldset>
        ) : null}

        {error ? <p className="identity-error">{error}</p> : null}
        {message ? <p className="identity-success">{message}</p> : null}

        <button type="submit" className="identity-btn" disabled={busy}>
          {busy
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : mode === 'register'
                ? 'Create account'
                : 'Send reset link'}
        </button>

        <div className="identity-links">
          {mode !== 'signin' ? (
            <button type="button" onClick={() => setMode('signin')}>
              Sign in
            </button>
          ) : null}
          {mode !== 'register' ? (
            <button type="button" onClick={() => setMode('register')}>
              Register
            </button>
          ) : null}
          {mode !== 'forgot' ? (
            <button type="button" onClick={() => setMode('forgot')}>
              Forgot password
            </button>
          ) : null}
          {allowSkip && onSkip ? (
            <button type="button" onClick={onSkip}>
              Continue without account
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
