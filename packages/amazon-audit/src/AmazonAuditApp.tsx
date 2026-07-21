'use client';

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
}

/**
 * Central Amazon Advertising Audit tool.
 * Host from marketplace, pousali, tools, or any other AdsGupta surface.
 */
export default function AmazonAuditApp({
  brand = 'neutral',
  config,
  theme = 'dark',
  className,
}: AmazonAuditAppProps) {
  return (
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
}
