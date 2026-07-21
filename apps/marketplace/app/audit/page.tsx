'use client';

import { AmazonAuditApp } from '@adsgupta/amazon-audit';
import '@adsgupta/amazon-audit/styles.css';

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
      <AmazonAuditApp brand="marketplace" theme="light" />
    </main>
  );
}
