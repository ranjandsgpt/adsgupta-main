import { redirect } from 'next/navigation';
import { getPlatformAuthOrigin, PLATFORM_AUTH_PATH } from '@adsgupta/auth';

/** Legacy exchange user admin — now centralized on adsgupta.com */
export default function ExchangeUsersRedirect() {
  redirect(`${getPlatformAuthOrigin()}${PLATFORM_AUTH_PATH}?view=admin`);
}
