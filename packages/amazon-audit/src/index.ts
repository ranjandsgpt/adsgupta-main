export { default as AmazonAuditApp } from './AmazonAuditApp';
export type { AmazonAuditAppProps } from './AmazonAuditApp';

export { AuditBrandProvider, useAuditBrand } from './brand/BrandContext';
export {
  AUDIT_BRANDS,
  resolveAuditBrand,
  type AuditBrandConfig,
  type AuditBrandId,
} from './brand/types';
export { getAuditBrandRuntime, setAuditBrandRuntime } from './brand/runtime';

/** List of API route segments hosts should mount under /api/* */
export const AMAZON_AUDIT_API_ROUTES = [
  'audit-feedback',
  'audit-self-healing',
  'copilot',
  'dual-engine',
  'engine-log',
  'export-invalidate',
  'export-status',
  'feedback',
  'generate-insights',
  'generate-presentation',
  'generate-presentation-pptx',
  'identify',
  'session',
  'telemetry-report',
  'zenith-boardroom-narrative',
  'zenith-export',
  'zenith-export-pdf',
  'zenith-narrative-polish',
] as const;
