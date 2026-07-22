# AdsGupta Platform (`apps/platform`)

Central login and admin user management for the AdsGupta network.

**URL:** `https://adsgupta.com/platform/usermanagement`

## Deploy

1. Create Vercel project `platform-adsgupta` with root directory `apps/platform`
2. Set env (same as marketplace): `NEXTAUTH_*`, `AUTH_*`, `ADMIN_USER_*`, `AUTH_DATABASE_URL`, optional Supabase/Razorpay for identity billing
3. Set `NEXT_PUBLIC_AUTH_API_BASE=/platform/api/auth`
4. On the **adsgupta.com** main frontend project, rewrite `/platform/*` → this deployment (see `apps/main/frontend/vercel.json`)

## Behaviour

- **Sign in / Start trial / Start free** across marketplace, blog, exchange → this page with `?returnTo=`
- **Regular users:** login → redirect back to `returnTo`
- **Admins** (`ADMIN_USER_*` emails): login → admin console (exchange users, freebies, payments)
