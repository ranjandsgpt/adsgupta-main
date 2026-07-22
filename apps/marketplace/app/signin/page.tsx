import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

export default function MarketplaceSignIn() {
  redirect(buildPlatformAuthUrl());
}
