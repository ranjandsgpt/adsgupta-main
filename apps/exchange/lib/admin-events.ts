import { sql } from "@/lib/db";

export type AdminActivityLogInput = {
  adminEmail: string;
  actionType: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
};

export async function logAdminActivity(input: AdminActivityLogInput): Promise<void> {
  const oldValue = input.oldValue === undefined ? null : JSON.stringify(input.oldValue);
  const newValue = input.newValue === undefined ? null : JSON.stringify(input.newValue);

  await sql`
    INSERT INTO admin_activity_log (
      admin_email,
      action_type,
      entity_type,
      entity_id,
      old_value,
      new_value
    )
    VALUES (
      ${input.adminEmail},
      ${input.actionType},
      ${input.entityType},
      ${input.entityId ?? null},
      ${oldValue},
      ${newValue}
    )
  `;
}

export type AdminNotificationInput = {
  type:
    | "new_publisher"
    | "new_campaign"
    | "performance_drop"
    | "budget_exhausted"
    | "system_alert";
  message: string;
  entityType?: string;
  entityId?: string;
};

export async function pushAdminNotification(input: AdminNotificationInput): Promise<void> {
  await sql`
    INSERT INTO admin_notifications (type, message, entity_type, entity_id)
    VALUES (${input.type}, ${input.message}, ${input.entityType ?? null}, ${input.entityId ?? null})
  `;
}

