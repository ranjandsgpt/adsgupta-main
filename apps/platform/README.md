# AdsGupta Platform (`apps/platform`)

Central Sign In, tools hub, and admin user management for the AdsGupta network.

**Production URL:** `https://adsgupta.com/platform`  
**Sign in:** `https://adsgupta.com/platform/usermanagement`

## Deploy (adsgupta-main = apex)

This app is the **Vercel project `adsgupta-main`** (domain `adsgupta.com`).

1. Vercel → Project **adsgupta-main** → Settings → General  
   - **Root Directory:** `apps/platform`
2. Env (Production + Preview): same auth/DB as before — `NEXTAUTH_*`, `AUTH_*`, `ADMIN_USER_*`, `AUTH_DATABASE_URL` / Supabase, and:
   - `NEXT_PUBLIC_AUTH_API_BASE=/platform/api/auth`
   - `NEXTAUTH_URL=https://adsgupta.com`
   - Do **not** set `NEXT_PUBLIC_PLATFORM_ASSET_PREFIX` on apex (same-origin `/_next`)
3. Build embeds the CRA marketing site from `apps/main/frontend` into `public/` so `/` stays the landing page and `/platform/*` is Next.js.

Optional legacy project `platform-adsgupta`: set `SKIP_MARKETING_BUILD=1` and `NEXT_PUBLIC_PLATFORM_ASSET_PREFIX=https://platform-adsgupta.vercel.app` if you still rewrite from another host.

## Behaviour

- **Sign In** across products → `/platform/usermanagement` → after auth → `/platform` tools hub
- Hub lists Exchange / Marketplace / Blog / TalentOS from the user’s roles
- **Admins:** User Management console at `/platform/usermanagement?view=admin`
