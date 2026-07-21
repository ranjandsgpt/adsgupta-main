import { NextResponse } from 'next/server';
import {
  activateSubscriberMembership,
  createServiceClient,
  getPassDurationHours,
  grantOrExtendEntitlement,
  revokeEntitlementByPayment,
  verifyWebhookSignature,
  writeAuditLog,
} from '../../../server';
import {
  assertPassAmount,
  shouldShortCircuitWebhookEvent,
} from '../../../lib/webhook-utils';

type RzpEntity = Record<string, unknown>;

function entityAmount(entity: RzpEntity | undefined): number | null {
  if (!entity) return null;
  const amount = entity.amount ?? entity.payment_amount;
  return typeof amount === 'number' ? amount : null;
}

async function findPaymentByOrderOrQr(
  supabase: ReturnType<typeof createServiceClient>,
  entity: RzpEntity
) {
  const orderId = typeof entity.order_id === 'string' ? entity.order_id : null;
  const paymentId = typeof entity.id === 'string' ? entity.id : null;
  const qrId =
    typeof entity.qr_code_id === 'string'
      ? entity.qr_code_id
      : typeof entity.id === 'string' && String(entity.type || '').includes('qr')
        ? entity.id
        : null;

  if (orderId) {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .maybeSingle();
    if (data) return data;
  }

  if (paymentId) {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle();
    if (data) return data;
  }

  if (qrId) {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_qr_id', qrId)
      .maybeSingle();
    if (data) return data;
  }

  return null;
}

async function grantFromCapture(
  supabase: ReturnType<typeof createServiceClient>,
  paymentRow: {
    id: string;
    user_id: string;
    app_id: string;
  },
  razorpayPaymentId: string,
  method?: string | null
) {
  const capturedAt = new Date();

  await supabase
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      status: 'captured',
      captured_at: capturedAt.toISOString(),
      method: method ?? null,
    })
    .eq('id', paymentRow.id);

  await activateSubscriberMembership(paymentRow.user_id, paymentRow.app_id);

  const entitlement = await grantOrExtendEntitlement({
    userId: paymentRow.user_id,
    appId: paymentRow.app_id,
    paymentId: paymentRow.id,
    razorpayPaymentId,
    capturedAt,
    durationHours: getPassDurationHours(),
  });

  await writeAuditLog({
    actorId: paymentRow.user_id,
    action: 'billing.webhook.payment.captured',
    targetType: 'payment',
    targetId: paymentRow.id,
    appId: paymentRow.app_id,
    metadata: {
      razorpay_payment_id: razorpayPaymentId,
      entitlement_id: entitlement.id,
    },
  });

  return entitlement;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    if (!verifyWebhookSignature({ rawBody, signature })) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: RzpEntity };
        qr_code?: { entity?: RzpEntity };
        refund?: { entity?: RzpEntity };
      };
    };

    const eventId =
      req.headers.get('x-razorpay-event-id') ||
      `${payload.event}:${Buffer.from(rawBody).toString('base64url').slice(0, 48)}`;

    const supabase = createServiceClient();

    const { data: existingEvent, error: existingError } = await supabase
      .from('webhook_events')
      .select('id, processed_at')
      .eq('id', eventId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (shouldShortCircuitWebhookEvent(existingEvent)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error: insertEventError } = await supabase
      .from('webhook_events')
      .upsert(
        {
          id: eventId,
          provider: 'razorpay',
          payload,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (insertEventError && insertEventError.code !== '23505') {
      throw insertEventError;
    }

    // Re-check after insert race
    const { data: afterInsert } = await supabase
      .from('webhook_events')
      .select('id, processed_at')
      .eq('id', eventId)
      .maybeSingle();

    if (shouldShortCircuitWebhookEvent(afterInsert)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const eventName = payload.event ?? '';
    const paymentEntity = payload.payload?.payment?.entity;
    const qrEntity = payload.payload?.qr_code?.entity;
    const refundEntity = payload.payload?.refund?.entity;

    if (eventName === 'payment.captured' && paymentEntity) {
      const amount = entityAmount(paymentEntity);
      if (amount != null) assertPassAmount(amount);

      const paymentRow = await findPaymentByOrderOrQr(supabase, paymentEntity);
      if (paymentRow) {
        const rzpPaymentId = String(paymentEntity.id);
        await grantFromCapture(
          supabase,
          paymentRow,
          rzpPaymentId,
          typeof paymentEntity.method === 'string' ? paymentEntity.method : null
        );
      }
    }

    if (eventName === 'payment.failed' && paymentEntity) {
      const paymentRow = await findPaymentByOrderOrQr(supabase, paymentEntity);
      if (paymentRow) {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            razorpay_payment_id:
              typeof paymentEntity.id === 'string'
                ? paymentEntity.id
                : paymentRow.razorpay_payment_id,
          })
          .eq('id', paymentRow.id);

        await writeAuditLog({
          action: 'billing.webhook.payment.failed',
          targetType: 'payment',
          targetId: paymentRow.id,
          appId: paymentRow.app_id,
          metadata: { event_id: eventId },
        });
      }
    }

    if (eventName === 'qr_code.credited' && (qrEntity || paymentEntity)) {
      const entity = paymentEntity ?? qrEntity!;
      const amount = entityAmount(entity);
      if (amount != null) assertPassAmount(amount);

      const paymentRow = await findPaymentByOrderOrQr(
        supabase,
        qrEntity
          ? { ...qrEntity, qr_code_id: qrEntity.id }
          : entity
      );

      if (paymentRow) {
        const rzpPaymentId =
          typeof paymentEntity?.id === 'string'
            ? paymentEntity.id
            : typeof entity.payment_id === 'string'
              ? entity.payment_id
              : `qr_${String(qrEntity?.id ?? paymentRow.id)}`;

        await grantFromCapture(supabase, paymentRow, rzpPaymentId, 'upi');
      }
    }

    if (eventName === 'qr_code.closed' && qrEntity) {
      const paymentRow = await findPaymentByOrderOrQr(supabase, {
        ...qrEntity,
        qr_code_id: qrEntity.id,
      });
      if (paymentRow && paymentRow.status === 'created') {
        await supabase
          .from('payments')
          .update({ status: 'failed', metadata: { ...paymentRow.metadata, qr_closed: true } })
          .eq('id', paymentRow.id);
      }
    }

    if (eventName === 'refund.processed') {
      const paymentId =
        typeof refundEntity?.payment_id === 'string'
          ? refundEntity.payment_id
          : typeof paymentEntity?.id === 'string'
            ? paymentEntity.id
            : null;

      if (paymentId) {
        const { data: paymentRow } = await supabase
          .from('payments')
          .select('*')
          .eq('razorpay_payment_id', paymentId)
          .maybeSingle();

        if (paymentRow) {
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('id', paymentRow.id);

          await revokeEntitlementByPayment(paymentId);

          await writeAuditLog({
            action: 'billing.webhook.refund.processed',
            targetType: 'payment',
            targetId: paymentRow.id,
            appId: paymentRow.app_id,
            metadata: { event_id: eventId },
          });
        }
      }
    }

    await supabase
      .from('webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', eventId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
