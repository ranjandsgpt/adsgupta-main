'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '../lib/supabase/browser';

interface IdentityContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const IdentityContext = createContext<IdentityContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => undefined,
  refresh: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<IdentityContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      async signOut() {
        await supabase.auth.signOut();
      },
      async refresh() {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      },
    }),
    [session, loading, supabase]
  );

  return (
    <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
  );
}

export function useIdentityAuth(): IdentityContextValue {
  return useContext(IdentityContext);
}
