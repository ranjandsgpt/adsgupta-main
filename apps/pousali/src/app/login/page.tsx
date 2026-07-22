import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl, sanitizeReturnTo } from '@adsgupta/auth';

export default function PousaliLoginRedirect({
  searchParams,
}: {
  searchParams?: { returnTo?: string };
}) {
  const returnTo = sanitizeReturnTo(
    searchParams?.returnTo || 'https://pousali.adsgupta.com/audit',
    'https://pousali.adsgupta.com'
  );
  redirect(buildPlatformAuthUrl({ returnTo }));
}
