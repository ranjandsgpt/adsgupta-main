import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

/** Blog admin settings user prefs — account management is centralized. */
export default function BlogSettingsRedirect() {
  redirect(buildPlatformAuthUrl({ returnTo: 'https://blog.adsgupta.com/admin' }));
}
