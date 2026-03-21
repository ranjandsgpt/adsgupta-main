# Deploying `apps/blog` on Vercel

## Fix: “No Output Directory named `public` found”

That error means **Output Directory** in Vercel is set to `public`. For **Next.js**, that is wrong.

- **`public/`** = static files (images, `favicon.ico`) that Next **copies** into the app — not the build output.
- **`.next/`** = where `next build` writes — Vercel’s Next.js integration uses this automatically.

### What to set in Vercel (Project → Settings → General)

| Setting | Value |
|--------|--------|
| **Root Directory** | `apps/blog` |
| **Framework Preset** | **Next.js** (not “Other”) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | **Leave empty** — do **not** set `public`, `dist`, or `.next` manually |
| **Install Command** | Default, or for monorepo: `cd ../.. && npm install` if installs must run from repo root |

Then **Redeploy**.

### Monorepo note

If the project runs `turbo` from the repo root, keep **Root Directory** = `apps/blog` so `next build` runs in the right package. Avoid a custom Output Directory; Next.js on Vercel does not use `public` as the deploy artifact.
