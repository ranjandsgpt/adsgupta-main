import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

/** Register CTAs → same central Sign In (no separate Get Started flow). */
export default function ExchangeRegisterRedirect() {
  redirect(buildPlatformAuthUrl());
}
