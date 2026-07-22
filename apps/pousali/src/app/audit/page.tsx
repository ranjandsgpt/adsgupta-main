'use client';

import { AmazonAuditApp } from '@adsgupta/amazon-audit';

/**
 * Pousali brand host for the marketplace Amazon audit tool.
 * Roles use app_slug `marketplace` (not pousali). Branding comes from the root layout.
 */
export default function AuditPage() {
  return <AmazonAuditApp brand="pousali" theme="dark" />;
}
