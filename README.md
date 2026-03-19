# adsgupta.com monorepo

This repository is a **Turborepo monorepo** that hosts all subdomain sites for **adsgupta.com**.

## Apps (websites)

- `apps/main` → adsgupta.com
- `apps/ranjan` → ranjan.adsgupta.com
- `apps/pousali` → pousali.adsgupta.com
- `apps/blog` → blog.adsgupta.com
- `apps/tools` → tools.adsgupta.com
- `apps/talentos` → talentos.adsgupta.com
- `apps/demoai` → demoai.adsgupta.com

## Shared packages

- `packages/ui` → shared `Header`, `Nav`, `Footer` components
- `packages/config` → shared colors, fonts, brand tokens

## Run locally

1) Install dependencies

```bash
npm install
```

2) Run all sites in dev mode

```bash
npm run dev
```

Turborepo will run each app’s `dev` script.

