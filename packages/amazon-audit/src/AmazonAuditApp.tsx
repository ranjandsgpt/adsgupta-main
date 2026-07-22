'use client';

import {
  AccessGate,
  AuthProvider,
  isIdentityConfigured,
} from '@adsgupta/identity';
import '@adsgupta/identity/styles.css';
import { AuthSessionProvider, CentralAuthGate } from '@adsgupta/auth';
import AuditPage from './audit/page';
import MetricsReferenceLoader from './audit/components/MetricsReferenceLoader';
import { AuditBrandProvider } from './brand/BrandContext';
import type { AuditBrandConfig, AuditBrandId } from './brand/types';

export interface AmazonAuditAppProps {
  brand?: AuditBrandId | string;
  config?: Partial<AuditBrandConfig>;
  theme?: 'light' | 'dark';
  className?: string;
  requireAuth?: boolean;
  allowAnonymous?: boolean;
}

/**
 * Amazon Advertising Audit — login via adsgupta.com/platform/usermanagement.
 * Billing/access gate via @adsgupta/identity when Supabase is configured.
 */
export default function AmazonAuditApp({
  brand = 'neutral',
  config,
  theme = 'dark',
  className,
  requireAuth = true,
  allowAnonymous = false,
}: AmazonAuditAppProps) {
  const tool = (
    <AuditBrandProvider brand={brand} config={config}>
      <div
        className={['amazon-audit-root', className].filter(Boolean).join(' ')}
        data-audit-theme={theme}
        data-audit-brand={typeof brand === 'string' ? brand : 'custom'}
      >
        <MetricsReferenceLoader />
        <AuditPage />
      </div>
    </AuditBrandProvider>
  );

  if (!requireAuth) return tool;

  const gated = isIdentityConfigured() ? (
    <AuthProvider>
      <AccessGate>{tool}</AccessGate>
    </AuthProvider>
  ) : (
    tool
  );

  return (
    <AuthSessionProvider>
      <CentralAuthGate allowSkip={allowAnonymous}>{gated}</CentralAuthGate>
    </AuthSessionProvider>
  );
}
