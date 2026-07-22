import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

/** Exchange login → central sign-in → tools hub at adsgupta.com/platform */
export default function ExchangeLoginRedirect() {
  redirect(buildPlatformAuthUrl());
}
