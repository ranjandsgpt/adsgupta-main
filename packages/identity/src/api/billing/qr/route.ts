import { NextResponse } from 'next/server';
import {
  createQr,
  createServiceClient,
  getAppBySlug,
  getAppSlug,
  getPassAmountPaise,
  isBillingQrEnabled,
  requireAuth,
  writeAuditLog,
} from '../../../server';

export async function POST() {
  if (!isBillingQrEnabled()) {
    return NextResponse.json({ error: 'QR billing is disabled' }, { status: 403 });
  }

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const appSlug = getAppSlug();
    const app = await getAppBySlug(appSlug);
    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const amountPaise = getPassAmountPaise();
    const closeBy = Math.floor(Date.now() / 1000) + 15 * 60;

    const qr = await createQr({
      name: `${app.name} pass`,
      description: '72-hour access pass',
      closeBy,
      amountPaise,
      notes: {
        user_id: auth.context.user.id,
        app_slug: appSlug,
      },
    });

    const supabase = createServiceClient();
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: auth.context.user.id,
        app_id: app.id,
        amount_paise: amountPaise,
        currency: 'INR',
        method: 'upi',
        razorpay_qr_id: qr.id,
        status: 'created',
        metadata: {
          qr_code_id: qr.id,
          image_url: qr.image_url,
        },
      })
      .select('*')
      .single();

    if (error) throw error;

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'billing.qr.created',
      targetType: 'payment',
      targetId: payment.id,
      appId: app.id,
      metadata: { qr_code_id: qr.id },
    });

    return NextResponse.json({ qr, payment, amount_paise: amountPaise });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create QR code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
