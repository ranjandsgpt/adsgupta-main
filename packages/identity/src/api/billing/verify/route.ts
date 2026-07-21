import { NextResponse } from 'next/server';
import {
  createServiceClient,
  requireAuth,
  verifyCheckoutSignature,
  writeAuditLog,
} from '../../../server';

/**
 * Client-side checkout callback ONLY.
 * Verifies HMAC signature and marks payment as `authorized`.
 * Entitlements are granted exclusively by the Razorpay webhook.
 */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          error:
            'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
        },
        { status: 400 }
      );
    }

    if (
      !verifyCheckoutSignature({
        orderId,
        paymentId,
        signature,
      })
    ) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: paymentRow, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', auth.context.user.id)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!paymentRow) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (
      paymentRow.status === 'captured' ||
      paymentRow.status === 'authorized'
    ) {
      return NextResponse.json({
        ok: true,
        payment: paymentRow,
        message: 'Payment already verified',
      });
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        status: 'authorized',
      })
      .eq('id', paymentRow.id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'billing.payment.authorized',
      targetType: 'payment',
      targetId: paymentRow.id,
      appId: paymentRow.app_id,
      metadata: { razorpay_payment_id: paymentId },
    });

    return NextResponse.json({
      ok: true,
      payment: updatedPayment,
      message:
        'Signature verified. Access activates after Razorpay webhook capture.',
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
