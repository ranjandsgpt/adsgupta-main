'use client';

import { AuthPanel, AuthSessionProvider } from '@adsgupta/auth';

export default function LoginPage() {
  return (
    <AuthSessionProvider>
      <main className="min-h-screen bg-white text-gray-900">
        <AuthPanel appName="Marketplace by AdsGupta" theme="light" />
      </main>
    </AuthSessionProvider>
  );
}
