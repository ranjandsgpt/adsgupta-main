import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { verifyCheckoutSignature, verifyWebhookSignature } from '../lib/razorpay';

describe('razorpay signatures', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test';
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('verifies checkout signature', () => {
    const orderId = 'order_123';
    const paymentId = 'pay_456';
    const signature = createHmac('sha256', 'test_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.equal(
      verifyCheckoutSignature({ orderId, paymentId, signature }),
      true
    );
  });

  it('rejects invalid checkout signature', () => {
    assert.equal(
      verifyCheckoutSignature({
        orderId: 'order_123',
        paymentId: 'pay_456',
        signature: 'bad',
      }),
      false
    );
  });

  it('verifies webhook signature', () => {
    const rawBody = '{"event":"payment.captured"}';
    const signature = createHmac('sha256', 'whsec_test')
      .update(rawBody)
      .digest('hex');

    assert.equal(verifyWebhookSignature({ rawBody, signature }), true);
  });
});
