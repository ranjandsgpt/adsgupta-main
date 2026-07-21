'use client';

import { AuthPanel, AuthSessionProvider } from '@adsgupta/auth';
import { AuthProvider, LoginPanel } from '@adsgupta/identity';
import '@adsgupta/identity/styles.css';

function useIdentityLogin() {
  if (typeof process === 'undefined') return true;
  if (process.env.NEXT_PUBLIC_IDENTITY_ENABLED === 'false') return false;
  if (process.env.NEXT_PUBLIC_IDENTITY_ENABLED === 'true') return true;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export default function LoginPage() {
  if (useIdentityLogin()) {
    return (
      <AuthProvider>
        <main className="min-h-screen">
          <LoginPanel appName="Pousali Dasgupta" theme="dark" />
        </main>
      </AuthProvider>
    );
  }

  return (
    <AuthSessionProvider>
      <main className="min-h-screen">
        <AuthPanel appName="Pousali Dasgupta" theme="dark" />
      </main>
    </AuthSessionProvider>
  );
}
