# @adsgupta/amazon-audit

Central **Amazon Advertising Audit** — part of the **marketplace** product tool, shared across AdsGupta brand hosts.

## Hosts

| Host | Brand id | URL | Central role `app_slug` |
|------|----------|-----|-------------------------|
| Marketplace | `marketplace` | https://marketplace.adsgupta.com/audit | `marketplace` |
| Pousali (brand site) | `pousali` | https://pousali.adsgupta.com/audit | `marketplace` (not a separate tool) |
| AdsGupta (future) | `adsgupta` | https://adsgupta.com/audit | `marketplace` |

Pousali is a brand/site host for this UI — roles and entitlements use `marketplace`, never `pousali` as a product slug.

## Usage

```tsx
'use client';
import { AmazonAuditApp } from '@adsgupta/amazon-audit';
import '@adsgupta/amazon-audit/styles.css';

export default function Page() {
  return <AmazonAuditApp brand="marketplace" theme="light" />;
}
```

Each host must:

1. Depend on `@adsgupta/amazon-audit`
2. Transpile the package in `next.config.js`
3. Mount the shared API routes under `/api/*` (see `AMAZON_AUDIT_API_ROUTES`)
4. Serve `public/metrics-reference.csv` (optional; improves validation)
5. Set `GEMINI_API_KEY` (and optional Supabase env) on the host deployment

## Branding

Brand config lives in `src/brand/types.ts`. Exports, feedback links, and titles read from `useAuditBrand()` / `getAuditBrandRuntime()` — no host-specific hardcoding in the tool core.

## Local fixture re-test

Fixtures live in gitignored `packages/amazon-audit/.fixtures/amazon-reports/` (copy from your Amazon Reports folder).

```bash
# From repo root
cp "/path/to/Amazon Reports/"*.{csv,xlsx} packages/amazon-audit/.fixtures/amazon-reports/
npm run test:fixtures --workspace=@adsgupta/amazon-audit
```

Expected stable KPIs for the Feb 2026 Crystal Bohemia sample set:
- adSpend ≈ €8604.75, adSales ≈ €11482.35, storeSales ≈ €21055.94, sessions = 17350
- Classifications: business, campaign, advertised_product, search_term, targeting

UI re-test: start marketplace or pousali, open `/audit`, upload the same five files, confirm KPIs, charts, PDF/PPTX downloads.
