import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  getPassAmountPaise,
  getPassDurationHours,
  isBillingQrEnabled,
  isFreebieEnabled,
} from '../lib/env';

describe('env helpers', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('defaults pass amount to 50000 paise', () => {
    delete process.env.PASS_AMOUNT_PAISE;
    assert.equal(getPassAmountPaise(), 50000);
  });

  it('defaults pass duration to 72 hours', () => {
    delete process.env.PASS_DURATION_HOURS;
    assert.equal(getPassDurationHours(), 72);
  });

  it('freebie is disabled by default', () => {
    delete process.env.FREEBIE_ENABLED;
    delete process.env.NEXT_PUBLIC_FREEBIE_ENABLED;
    assert.equal(isFreebieEnabled(), false);
  });

  it('respects FREEBIE_ENABLED flag', () => {
    process.env.FREEBIE_ENABLED = 'true';
    assert.equal(isFreebieEnabled(), true);
  });

  it('respects BILLING_QR_ENABLED flag', () => {
    process.env.BILLING_QR_ENABLED = 'true';
    assert.equal(isBillingQrEnabled(), true);
  });
});
