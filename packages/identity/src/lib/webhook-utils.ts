/** Pure helpers extractable for webhook idempotency tests */

export function shouldShortCircuitWebhookEvent(existing: {
  id: string;
  processed_at: string | null;
} | null): boolean {
  return Boolean(existing?.processed_at);
}

export function assertPassAmount(amountPaise: number): void {
  if (amountPaise !== 50000) {
    throw new Error(`Expected amount 50000 paise, got ${amountPaise}`);
  }
}
