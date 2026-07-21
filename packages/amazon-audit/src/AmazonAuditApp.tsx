'use client';

import { AuthGate, AuthSessionProvider } from '@adsgupta/auth';
import {
  AccessGate,
  AuthProvider,
  IdentityGate,
  isIdentityConfigured,
} from '@adsgupta/identity';
import '@adsgupta/identity/styles.css';
import AuditPage from './audit/page';
import MetricsReferenceLoader from './audit/components/MetricsReferenceLoader';
import { AuditBrandProvider } from './brand/BrandContext';
import type { AuditBrandConfig, AuditBrandId } from './brand/types';

export interface AmazonAuditAppProps {
  /** Which AdsGupta surface is hosting the tool */
  brand?: AuditBrandId | string;
  /** Optional overrides (homeHref, feedbackUrl, etc.) */
  config?: Partial<AuditBrandConfig>;
  /** Visual theme for CSS variables */
  theme?: 'light' | 'dark';
  className?: string;
  /** Require login before using the tool (default true) */
  requireAuth?: boolean;
  /** Allow continuing without an account */
  allowAnonymous?: boolean;
}

/**
 * Central Amazon Advertising Audit tool.
 * Prefers @adsgupta/identity (Supabase + billing) when configured;
 * falls back to legacy @adsgupta/auth (NextAuth) until Supabase env is set.
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

  if (isIdentityConfigured()) {
    return (
      <AuthProvider>
        <IdentityGate
          appName="Amazon Advertising Audit"
          theme={theme}
          allowSkip={allowAnonymous}
        >
          <AccessGate>{tool}</AccessGate>
        </IdentityGate>
      </AuthProvider>
    );
  }

  return (
    <AuthSessionProvider>
      <AuthGate
        appName="Amazon Advertising Audit"
        theme={theme}
        allowSkip={allowAnonymous}
      >
        {tool}
      </AuthGate>
    </AuthSessionProvider>
  );
}
