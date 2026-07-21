# @adsgupta/amazon-audit

Central **Amazon Advertising Audit** tool shared across AdsGupta surfaces.

## Hosts

| Host | Brand id | URL |
|------|----------|-----|
| Marketplace | `marketplace` | https://marketplace.adsgupta.com/audit |
| Pousali | `pousali` | https://pousali.adsgupta.com/audit |
| AdsGupta (future) | `adsgupta` | https://adsgupta.com/audit |

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
