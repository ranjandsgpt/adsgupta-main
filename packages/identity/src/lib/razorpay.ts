import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  getPassAmountPaise,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
} from './env';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

function basicAuthHeader(): string {
  const credentials = `${getRazorpayKeyId()}:${getRazorpayKeySecret()}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

async function razorpayFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const body = (await response.json()) as T & { error?: { description?: string } };

  if (!response.ok) {
    const message =
      body?.error?.description ||
      `Razorpay request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  created_at: number;
}

export interface RazorpayQrCode {
  id: string;
  image_url: string;
  payment_amount: number;
  status: string;
  close_by?: number;
}

export interface CreateOrderInput {
  receipt: string;
  notes?: Record<string, string>;
  amountPaise?: number;
}

export async function createOrder(input: CreateOrderInput): Promise<RazorpayOrder> {
  const amount = input.amountPaise ?? getPassAmountPaise();
  if (amount !== 50000) {
    throw new Error(`Pass amount must be 50000 paise (₹500), got ${amount}`);
  }

  return razorpayFetch<RazorpayOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });
}

export interface CreateQrInput {
  name: string;
  description?: string;
  closeBy?: number;
  notes?: Record<string, string>;
  amountPaise?: number;
}

export async function createQr(input: CreateQrInput): Promise<RazorpayQrCode> {
  const amount = input.amountPaise ?? getPassAmountPaise();
  if (amount !== 50000) {
    throw new Error(`Pass amount must be 50000 paise (₹500), got ${amount}`);
  }

  return razorpayFetch<RazorpayQrCode>('/payments/qr_codes', {
    method: 'POST',
    body: JSON.stringify({
      type: 'upi_qr',
      name: input.name,
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amount,
      description: input.description ?? 'AdsGupta 72-hour pass',
      close_by: input.closeBy,
      notes: input.notes ?? {},
    }),
  });
}

export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpayFetch<RazorpayPayment>(`/payments/${paymentId}`);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = createHmac('sha256', getRazorpayKeySecret())
    .update(payload)
    .digest('hex');

  return safeCompare(expected, input.signature);
}

export function verifyWebhookSignature(input: {
  rawBody: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = input.secret ?? getRazorpayWebhookSecret();
  if (!secret) return false;

  const expected = createHmac('sha256', secret)
    .update(input.rawBody)
    .digest('hex');

  return safeCompare(expected, input.signature);
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
