import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl, sanitizeReturnTo } from '@adsgupta/auth';

export default function MarketplaceSignIn({
  searchParams,
}: {
  searchParams?: { returnTo?: string };
}) {
  const returnTo = sanitizeReturnTo(
    searchParams?.returnTo || 'https://marketplace.adsgupta.com/audit',
    'https://marketplace.adsgupta.com'
  );
  redirect(buildPlatformAuthUrl({ returnTo }));
}
