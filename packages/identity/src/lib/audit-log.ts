import { createServiceClient } from './supabase/admin';

export interface WriteAuditLogInput {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  appId?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from('audit_log').insert({
    actor_id: input.actorId ?? null,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    app_id: input.appId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) throw error;
}
