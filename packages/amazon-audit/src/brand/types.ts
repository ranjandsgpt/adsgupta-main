export type AuditBrandId = 'marketplace' | 'pousali' | 'adsgupta' | 'neutral';

export interface AuditBrandConfig {
  id: AuditBrandId;
  /** Product / tool display name */
  productName: string;
  /** Organization or person credited in exports */
  preparedBy: string;
  /** Public site origin, e.g. https://marketplace.adsgupta.com */
  siteUrl: string;
  /** Path for in-app "back" navigation */
  homeHref: string;
  /** Feedback form URL */
  feedbackUrl: string;
  /** Canonical SEO URL for this host's /audit page */
  canonicalUrl: string;
  /** Optional short tagline under the title */
  tagline?: string;
  /** When true, omit portfolio-style chrome (host provides its own nav) */
  embeddable: boolean;
}

export const AUDIT_BRANDS: Record<AuditBrandId, AuditBrandConfig> = {
  marketplace: {
    id: 'marketplace',
    productName: 'Amazon Advertising Audit',
    preparedBy: 'Marketplace by AdsGupta',
    siteUrl: 'https://marketplace.adsgupta.com',
    homeHref: '/',
    feedbackUrl: 'https://marketplace.adsgupta.com/audit-feedback',
    canonicalUrl: 'https://marketplace.adsgupta.com/audit',
    tagline: 'AI-powered Amazon intelligence for agencies and brands',
    embeddable: true,
  },
  pousali: {
    id: 'pousali',
    productName: 'Amazon Advertising Performance Audit',
    preparedBy: 'Pousali Dasgupta',
    siteUrl: 'https://pousali.adsgupta.com',
    homeHref: '/',
    feedbackUrl: 'https://pousali.adsgupta.com/audit-feedback',
    canonicalUrl: 'https://pousali.adsgupta.com/audit',
    tagline: 'TACOS, Bleeders, ASIN-level profitability',
    embeddable: false,
  },
  adsgupta: {
    id: 'adsgupta',
    productName: 'Amazon Advertising Audit',
    preparedBy: 'AdsGupta',
    siteUrl: 'https://adsgupta.com',
    homeHref: '/',
    feedbackUrl: 'https://adsgupta.com/audit-feedback',
    canonicalUrl: 'https://adsgupta.com/audit',
    tagline: 'Central Amazon audit tool across the AdsGupta network',
    embeddable: true,
  },
  neutral: {
    id: 'neutral',
    productName: 'Amazon Advertising Audit',
    preparedBy: 'AdsGupta',
    siteUrl: 'https://adsgupta.com',
    homeHref: '/',
    feedbackUrl: 'https://adsgupta.com/audit-feedback',
    canonicalUrl: 'https://adsgupta.com/audit',
    embeddable: true,
  },
};

export function resolveAuditBrand(brand?: AuditBrandId | string | null): AuditBrandConfig {
  if (brand && brand in AUDIT_BRANDS) {
    return AUDIT_BRANDS[brand as AuditBrandId];
  }
  return AUDIT_BRANDS.neutral;
}
