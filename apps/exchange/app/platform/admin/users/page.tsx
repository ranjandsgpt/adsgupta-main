import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl } from '@adsgupta/auth';

/** Legacy exchange user admin — now centralized on adsgupta.com */
export default function ExchangeUsersRedirect() {
  redirect(buildPlatformAuthUrl({ returnTo: 'https://exchange.adsgupta.com/platform' }));
}
