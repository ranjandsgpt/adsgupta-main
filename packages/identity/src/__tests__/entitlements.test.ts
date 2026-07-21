import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeExpiresAt } from '../lib/entitlements';
import {
  assertPassAmount,
  shouldShortCircuitWebhookEvent,
} from '../lib/webhook-utils';

describe('computeExpiresAt', () => {
  it('stacks from current expiry when still active', () => {
    const now = new Date('2026-01-10T12:00:00Z');
    const current = new Date('2026-01-12T12:00:00Z');
    const capturedAt = new Date('2026-01-10T11:00:00Z');
    const result = computeExpiresAt(now, current, 72, capturedAt);
    assert.equal(result.toISOString(), '2026-01-15T12:00:00.000Z');
  });

  it('uses now when no current entitlement', () => {
    const now = new Date('2026-01-10T12:00:00Z');
    const capturedAt = new Date('2026-01-10T10:00:00Z');
    const result = computeExpiresAt(now, null, 72, capturedAt);
    assert.equal(result.toISOString(), '2026-01-13T12:00:00.000Z');
  });

  it('uses capturedAt when later than now and no current', () => {
    const now = new Date('2026-01-10T12:00:00Z');
    const capturedAt = new Date('2026-01-10T14:00:00Z');
    const result = computeExpiresAt(now, undefined, 24, capturedAt);
    assert.equal(result.toISOString(), '2026-01-11T14:00:00.000Z');
  });
});

describe('webhook idempotency helpers', () => {
  it('short-circuits when processed_at is set', () => {
    assert.equal(
      shouldShortCircuitWebhookEvent({
        id: 'evt_1',
        processed_at: '2026-01-01T00:00:00Z',
      }),
      true
    );
  });

  it('does not short-circuit unprocessed events', () => {
    assert.equal(
      shouldShortCircuitWebhookEvent({ id: 'evt_1', processed_at: null }),
      false
    );
    assert.equal(shouldShortCircuitWebhookEvent(null), false);
  });

  it('asserts pass amount is 50000', () => {
    assert.doesNotThrow(() => assertPassAmount(50000));
    assert.throws(() => assertPassAmount(100), /50000/);
  });
});
