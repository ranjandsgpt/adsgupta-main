import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

export default function BlogSettingsLoginRedirect() {
  redirect(buildPlatformAuthUrl());
}
