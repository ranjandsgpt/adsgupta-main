import { NextResponse } from 'next/server';
import {
  createServiceClient,
  getPassDurationHours,
  grantOrExtendEntitlement,
  requireRole,
  revokeEntitlementByPayment,
  writeAuditLog,
} from '../../../server';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('entitlements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ entitlements: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to list entitlements';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      action?: 'extend' | 'revoke';
      user_id?: string;
      app_id?: string;
      entitlement_id?: string;
      source_payment?: string;
      duration_hours?: number;
    };

    if (body.action === 'revoke') {
      if (body.entitlement_id && !body.source_payment) {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from('entitlements')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', body.entitlement_id)
          .select('*')
          .maybeSingle();
        if (error) throw error;
        return NextResponse.json({ entitlement: data });
      }

      const key = body.source_payment;
      if (!key) {
        return NextResponse.json(
          { error: 'source_payment or entitlement_id required' },
          { status: 400 }
        );
      }

      const entitlement = await revokeEntitlementByPayment(key);
      return NextResponse.json({ entitlement });
    }

    if (body.action === 'extend') {
      if (!body.user_id || !body.app_id) {
        return NextResponse.json(
          { error: 'user_id and app_id required for extend' },
          { status: 400 }
        );
      }

      const syntheticId = `admin_extend_${Date.now()}`;
      const entitlement = await grantOrExtendEntitlement({
        userId: body.user_id,
        appId: body.app_id,
        razorpayPaymentId: syntheticId,
        capturedAt: new Date(),
        durationHours: body.duration_hours ?? getPassDurationHours(),
      });

      await writeAuditLog({
        actorId: auth.context.user.id,
        action: 'admin.entitlement.extended',
        targetType: 'entitlement',
        targetId: entitlement.id,
        appId: body.app_id,
      });

      return NextResponse.json({ entitlement });
    }

    return NextResponse.json(
      { error: "action must be 'extend' or 'revoke'" },
      { status: 400 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update entitlement';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
