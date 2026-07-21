import { resolveAuditBrand, type AuditBrandConfig, type AuditBrandId } from './types';

let runtimeBrand: AuditBrandConfig = resolveAuditBrand('neutral');

/** Set from AuditBrandProvider so non-React export helpers can read brand. */
export function setAuditBrandRuntime(brand: AuditBrandId | string | AuditBrandConfig) {
  if (typeof brand === 'object' && brand && 'id' in brand) {
    runtimeBrand = brand;
    return;
  }
  runtimeBrand = resolveAuditBrand(brand as string);
}

export function getAuditBrandRuntime(): AuditBrandConfig {
  return runtimeBrand;
}
