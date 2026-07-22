import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

export default function ExchangeRegisterRedirect() {
  redirect(buildPlatformAuthUrl({ mode: 'register', returnTo: 'https://exchange.adsgupta.com' }));
}
