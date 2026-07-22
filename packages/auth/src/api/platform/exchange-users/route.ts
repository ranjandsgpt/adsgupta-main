import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';

/** Exchange platform_users — same Neon DB as exchange.adsgupta.com */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email || !isPlatformAdminEmail(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url =
    process.env.AUTH_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ users: [], stats: { total: 0 } });
  }

  try {
    const sql = neon(url);
    const rows = await sql`
      SELECT
        id::text,
        email,
        name,
        role,
        status,
        created_at::text,
        last_login_at::text,
        deleted_at::text
      FROM platform_users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({
      users: rows,
      stats: {
        total: rows.length,
        active: rows.filter((r) => r.status === 'active').length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Query failed';
    return NextResponse.json({ error: message, users: [] }, { status: 500 });
  }
}
