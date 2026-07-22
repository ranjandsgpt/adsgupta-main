# @adsgupta/identity

Central AdsGupta identity, memberships, entitlements, and Razorpay billing for multi-app surfaces (starting with **audit-tool**).

Exchange and blog hosts adopt this in a later phase — do not wire them yet.

## Features

- Supabase Auth sessions shared across `*.adsgupta.com` via `AUTH_COOKIE_DOMAIN`
- Per-app memberships (`admin`, `subscriber`, `freebie`)
- Statuses: `pending_approval | awaiting_payment | active | expired | rejected | suspended`
- 72-hour pass entitlements (₹500 / 50000 paise) — **granted only by Razorpay webhook**
- Client `/api/billing/verify` only HMAC-verifies and marks payment `authorized`
- Freebie track gated by `FREEBIE_ENABLED` until product scope is finalized
- Custom Access Token Hook injects membership claims into JWT

## Environment variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | — | Browser / user client |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (server) | — | Webhooks, entitlements, admin |
| `AUTH_COOKIE_DOMAIN` | no | `.adsgupta.com` | Shared session cookies |
| `APP_SLUG` | no | `audit-tool` | Host app identifier |
| `PASS_AMOUNT_PAISE` | no | `50000` | Must stay ₹500 |
| `PASS_DURATION_HOURS` | no | `72` | Entitlement window |
| `RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | billing | — | Checkout |
| `RAZORPAY_KEY_SECRET` | billing | — | Signature verify |
| `RAZORPAY_WEBHOOK_SECRET` | webhooks | — | Webhook HMAC |
| `FREEBIE_ENABLED` / `NEXT_PUBLIC_FREEBIE_ENABLED` | no | off | Freebie access gate |
| `BILLING_QR_ENABLED` | no | off | UPI QR endpoint |
| `CRON_SECRET` | cron | — | `/api/cron/expire` bearer |
| `NEXT_PUBLIC_IDENTITY_ENABLED` | hosts | auto | Force identity UI on/off; without Supabase URL, audit falls back to `@adsgupta/auth` |

## Database migration

1. Open Supabase SQL editor
2. Run `supabase/migrations/001_identity_core.sql`
3. Auth → Hooks → **Custom Access Token Hook** → `public.custom_access_token_hook`
4. Auth → JWT → enable **asymmetric signing keys**
5. Point Razorpay webhook to `https://<host>/api/billing/webhook`

## Host mounting (marketplace tool; Pousali brand host)

Mount identity APIs on the **marketplace** product host. Pousali may also host the same audit UI as a brand site — it is not a separate product; prefer `APP_SLUG=marketplace` (legacy DB seed may still say `audit-tool`).

```ts
// app/api/me/route.ts
export { GET } from '@adsgupta/identity/api/me/route';
```

Also mount: `/api/register`, `/api/billing/{order,verify,webhook,qr}`, `/api/admin/*`, `/api/cron/expire`, `/api/auth/callback`.

Middleware session refresh:

```ts
import { updateSession } from '@adsgupta/identity/middleware';
```

## Register flow

1. Client: `supabase.auth.signUp(...)`
2. Client: `POST /api/register` with `{ track: 'freebie' | 'subscriber' }`
   - freebie → `pending_approval`
   - subscriber → `awaiting_payment`

## Billing flow

1. `POST /api/billing/order` → Razorpay Checkout
2. `POST /api/billing/verify` → HMAC only → status `authorized`
3. Razorpay `payment.captured` webhook → assert amount 50000 → `grantOrExtendEntitlement` + membership `active` / role `subscriber`
4. UI polls `/api/me` until `access.allowed`

## Scripts

```bash
npm install
npm run build -w @adsgupta/identity
npm run test -w @adsgupta/identity
```
