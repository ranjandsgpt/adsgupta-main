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
        <main className="min-h-screen bg-white text-gray-900">
          <LoginPanel appName="Marketplace by AdsGupta" theme="light" />
        </main>
      </AuthProvider>
    );
  }

  return (
    <AuthSessionProvider>
      <main className="min-h-screen bg-white text-gray-900">
        <AuthPanel appName="Marketplace by AdsGupta" theme="light" />
      </main>
    </AuthSessionProvider>
  );
}
