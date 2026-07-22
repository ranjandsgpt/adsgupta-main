# @adsgupta/auth

Central AdsGupta identity for the four product tools — **exchange**, **marketplace** (includes Amazon audit), **blog**, **talentos** — plus the **platform** hub for admins.

Pousali (`pousali.adsgupta.com`) is a brand/site that may host marketplace audit UI; it is not a separate product tool or `app_slug`.

## Features

- Google sign-in
- Email + password register / login
- Forgot password + reset link
- Shared session cookie on `.adsgupta.com` (cross-subdomain ready)

## Host setup

1. Depend on `@adsgupta/auth`
2. Wrap the app (or tool) with `AuthSessionProvider`
3. Mount routes:

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '@adsgupta/auth/nextauth';

// app/api/auth/register/route.ts
export { POST } from '@adsgupta/auth/api/register/route';

// app/api/auth/forgot-password/route.ts
export { POST } from '@adsgupta/auth/api/forgot-password/route';

// app/api/auth/reset-password/route.ts
export { POST } from '@adsgupta/auth/api/reset-password/route';
```

4. Gate the product UI:

```tsx
import { AuthGate, AuthSessionProvider } from '@adsgupta/auth';

<AuthSessionProvider>
  <AuthGate appName="Amazon Advertising Audit" theme="light">
    <AmazonAuditApp brand="marketplace" />
  </AuthGate>
</AuthSessionProvider>
```

## Env vars

| Var | Required | Purpose |
|-----|----------|---------|
| `NEXTAUTH_SECRET` | yes | JWT/cookie signing |
| `NEXTAUTH_URL` | yes | Host origin, e.g. `https://marketplace.adsgupta.com` |
| `AUTH_COOKIE_DOMAIN` | optional | Default `.adsgupta.com` in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google | Google OAuth web client |
| `AUTH_DATABASE_URL` or `POSTGRES_URL` | for password auth | Neon/Postgres user store (`central_users`). If the same DB has Exchange `platform_users`, those accounts are merged automatically so existing Exchange passwords work. |
| `ADMIN_USER_1_EMAIL` / `ADMIN_USER_1_PASSWORD` (and `_2`…) | optional | Same plaintext admin creds as **blog.adsgupta.com**. On successful login they are hashed into `central_users`. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | alt DB | Supabase `central_users` table |
| `RESEND_API_KEY` | for reset emails | Password reset delivery |
| `AUTH_FROM_EMAIL` | optional | From address for Resend |

### Supabase table (if using Supabase)

```sql
create table if not exists central_users (
  id text primary key,
  email text unique not null,
  name text,
  password_hash text,
  image text,
  email_verified timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Google OAuth

Create a Web application OAuth client in Google Cloud Console. Authorized redirect URIs:

- `https://marketplace.adsgupta.com/api/auth/callback/google`
- `https://pousali.adsgupta.com/api/auth/callback/google` (brand host for marketplace audit; roles use `marketplace`)
- `http://localhost:3006/api/auth/callback/google` (dev)

### Central `user_app_roles` app slugs

| Slug | Kind | Notes |
|------|------|--------|
| `exchange` | tool | AdsGupta Exchange |
| `marketplace` | tool | Marketplace + Amazon audit (any host, including Pousali) |
| `blog` | tool | Blog CMS |
| `talentos` | tool | Role slot ready; TalentOS still uses its own JWT until Phase 2 SSO |
| `platform` | hub | Platform admins only — not a customer tool |

Legacy writes of `pousali` / `audit-tool` / `amazon-audit` are normalized to `marketplace`.
