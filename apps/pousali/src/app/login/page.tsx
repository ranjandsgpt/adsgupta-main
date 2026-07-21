'use client';

import { AuthPanel, AuthSessionProvider } from '@adsgupta/auth';

export default function LoginPage() {
  return (
    <AuthSessionProvider>
      <main className="min-h-screen">
        <AuthPanel appName="Pousali Dasgupta" theme="dark" />
      </main>
    </AuthSessionProvider>
  );
}
