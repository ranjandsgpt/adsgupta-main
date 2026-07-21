import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createOrder,
  createServiceClient,
  getAppBySlug,
  getAppSlug,
  getPassAmountPaise,
  requireAuth,
  writeAuditLog,
} from '../../../server';

export async function POST() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const appSlug = getAppSlug();
    const app = await getAppBySlug(appSlug);
    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const supabase = createServiceClient();
    const amountPaise = getPassAmountPaise();
    const receipt = `pass_${randomUUID()}`;

    const order = await createOrder({
      receipt,
      notes: {
        user_id: auth.context.user.id,
        app_slug: appSlug,
      },
      amountPaise,
    });

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: auth.context.user.id,
        app_id: app.id,
        razorpay_order_id: order.id,
        amount_paise: amountPaise,
        status: 'created',
        metadata: { receipt },
      })
      .select('*')
      .single();

    if (error) throw error;

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'billing.order.created',
      targetType: 'payment',
      targetId: payment.id,
      appId: app.id,
      metadata: { razorpay_order_id: order.id },
    });

    return NextResponse.json({
      order,
      payment,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount_paise: amountPaise,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
