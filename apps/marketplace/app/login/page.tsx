import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

/** Marketplace login → central sign-in → tools hub */
export default function MarketplaceLoginRedirect() {
  redirect(buildPlatformAuthUrl());
}
