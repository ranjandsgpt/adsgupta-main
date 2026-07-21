'use client';

import { AmazonAuditApp } from '@adsgupta/amazon-audit';

/**
 * Pousali host for the central Amazon audit tool.
 * Branding / portfolio chrome come from the root layout; the tool itself is shared.
 */
export default function AuditPage() {
  return <AmazonAuditApp brand="pousali" theme="dark" />;
}
