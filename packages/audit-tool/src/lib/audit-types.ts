export interface AuditFile {
  file: File;
  /** Original name (may differ if xlsx normalized). */
  name: string;
  /** CSV mime type or original. */
  type: string;
  size: number;
}

export interface AuditMetrics {
  totalAdSpend: number;
  totalAdSales: number;
  totalStoreSales: number;
  acosPct: number | null;
  roas: number | null;
  tacosPct: number | null;
  clicks: number;
  impressions: number;
  orders: number;
  sessions: number;
  buyBoxPct: number | null;
  currency: string | null;
}

export interface AuditResult {
  /** Deterministic aggregated metrics (single source of truth). */
  metrics: AuditMetrics;
  /** Raw store object used by the original pousali audit UI. */
  store: unknown;
  /** Verification summary (confidence, errors). */
  verification: unknown;
}

