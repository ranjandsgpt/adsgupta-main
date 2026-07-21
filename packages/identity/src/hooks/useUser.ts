'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MeResponse } from '../types';
import { useIdentityAuth } from '../components/AuthProvider';

export function useUser() {
  const auth = useIdentityAuth();
  return {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    signOut: auth.signOut,
  };
}

export function useEntitlement(pollMs = 0) {
  const { user, loading: authLoading } = useIdentityAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setMe(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      const data = (await res.json()) as MeResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load /api/me');
      }
      setMe(data);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load me';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  useEffect(() => {
    if (!pollMs || !user) return;
    const id = window.setInterval(() => {
      void refresh();
    }, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, user, refresh]);

  return {
    me,
    entitlement: me?.entitlement ?? null,
    access: me?.access ?? null,
    membership: me?.membership ?? null,
    loading: authLoading || loading,
    error,
    refresh,
  };
}
