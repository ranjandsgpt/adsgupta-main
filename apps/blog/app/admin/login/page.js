import { redirect } from 'next/navigation';
import { buildPlatformAuthUrl, sanitizeReturnTo } from '@adsgupta/auth';

export default function BlogLoginRedirect({ searchParams }) {
  const from = typeof searchParams?.from === 'string' ? searchParams.from : '/admin';
  const returnTo = sanitizeReturnTo(
    `https://blog.adsgupta.com${from.startsWith('/') ? from : `/${from}`}`,
    'https://blog.adsgupta.com/admin'
  );
  redirect(buildPlatformAuthUrl({ returnTo }));
}
