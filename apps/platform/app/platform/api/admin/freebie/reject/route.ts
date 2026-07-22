import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';
import { createServiceClient, writeAuditLog } from '@adsgupta/identity/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isPlatformAdminEmail(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isIdentityConfigured()) {
    return NextResponse.json(
      { error: 'Supabase identity is not configured on this host yet.' },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as { membership_id?: string; reason?: string };
    const membershipId = body.membership_id?.trim();
    if (!membershipId) {
      return NextResponse.json({ error: 'membership_id is required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const rejectedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('memberships')
      .update({
        status: 'rejected',
        rejected_at: rejectedAt,
      })
      .eq('id', membershipId)
      .eq('track', 'freebie')
      .select('*, app:apps(*)')
      .single();

    if (error) throw error;

    await writeAuditLog({
      actorId: null,
      action: 'membership.freebie.rejected',
      targetType: 'membership',
      targetId: membershipId,
      appId: data.app_id,
      metadata: { actor_email: email, reason: body.reason?.trim() || null },
    });

    return NextResponse.json({ membership: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reject failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
