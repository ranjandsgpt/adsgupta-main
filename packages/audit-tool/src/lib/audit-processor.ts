import type { AuditFile, AuditResult } from './audit-types';

export interface AuditProcessorOptions {
  /** Optional base URL for API routes (no hardcoded domains). */
  apiBaseUrl?: string;
  /** AbortSignal for long parsing tasks. */
  signal?: AbortSignal;
}

/**
 * Single entry point for the shared audit tool.
 *
 * This processor intentionally stays framework-agnostic (no Next imports) and does not hardcode domains.
 *
 * Current implementation:
 * - Supports CSV + XLSX (XLSX normalized to CSV using `xlsx`)
 * - Parses rows with Papa Parse (streaming not required for the default UI)
 * - Produces the same canonical "aggregated metrics" used by the existing audit flow:
 *   SP Advertised Product report is the source of truth for ad totals, Business Report for store totals.
 */
export async function runAuditProcessor(
  files: AuditFile[],
  options?: AuditProcessorOptions
): Promise<AuditResult> {
  options?.signal?.throwIfAborted?.();

  const rawFiles = files.map((f) => f.file);

  const XLSX = await import('xlsx');
  const Papa: any = (await import('papaparse')).default ?? (await import('papaparse'));

  const normalizedCsvFiles: File[] = [];
  for (const f of rawFiles) {
    options?.signal?.throwIfAborted?.();
    if (/\.(xlsx|xls)$/i.test(f.name)) {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const first = wb.SheetNames[0];
      const sheet = wb.Sheets[first];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      normalizedCsvFiles.push(new File([blob], f.name.replace(/\.(xlsx|xls)$/i, '.csv'), { type: 'text/csv' }));
    } else {
      normalizedCsvFiles.push(f);
    }
  }

  type Row = Record<string, string>;

  const spAdvertisedRows: Row[] = [];
  const spTargetingRows: Row[] = [];
  const spSearchTermRows: Row[] = [];
  const businessRows: Row[] = [];

  const hasAny = (headers: string[], candidates: string[]) =>
    candidates.some((c) => headers.some((h) => h.trim().toLowerCase() === c.trim().toLowerCase()));

  for (const f of normalizedCsvFiles) {
    options?.signal?.throwIfAborted?.();
    const text = await f.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    const rows: Row[] = (parsed.data as any[])
      .filter((r) => r && typeof r === 'object')
      .map((r) => {
        const out: Row = {};
        for (const [k, v] of Object.entries(r)) out[String(k)] = String(v ?? '');
        return out;
      });

    const headers: string[] =
      (parsed.meta?.fields as string[] | undefined) ??
      (rows[0] ? Object.keys(rows[0]) : []);

    // Heuristics aligned with `apps/pousali/src/lib/aggregateReports.ts`
    const isBusiness = hasAny(headers, [
      'Ordered Product Sales',
      'Sessions – Total',
      'Sessions - Total',
      'Featured Offer (Buy Box) percentage',
      'Units ordered',
      'Total order items',
    ]);

    const isSpAdvertised = hasAny(headers, [
      'Spend',
      '7 Day Total Sales',
      '7 Day Total Orders (#)',
      'Impressions',
      'Clicks',
      'Advertised SKU',
      'Advertised ASIN',
    ]);

    const isSearchTerm = hasAny(headers, ['Customer Search Term', 'Search Term']);

    if (isBusiness) {
      businessRows.push(...rows);
    } else if (isSpAdvertised) {
      // Treat any advertising-like report with these columns as the source of truth for totals.
      // This matches the existing "SP Advertised Product Report is single source of truth" approach.
      spAdvertisedRows.push(...rows);
      if (isSearchTerm) spSearchTermRows.push(...rows);
      else spTargetingRows.push(...rows);
    } else {
      // Unknown files are ignored (to match existing UX: only supported reports contribute).
    }
  }

  // ---- Canonical aggregation (copied from `apps/pousali/src/lib/aggregateReports.ts`) ----
  const parseNumber = (val: unknown): number => {
    if (val == null || val === '' || val === '--' || val === '-') return 0;
    return parseFloat(String(val).replace(/,/g, '')) || 0;
  };
  const parseCurrency = (val: unknown): number => {
    if (val == null || val === '' || val === '--' || val === '-') return 0;
    return parseFloat(String(val).replace(/[^0-9.\-]/g, '')) || 0;
  };
  const parsePercent = (val: unknown): number => {
    if (val == null || val === '' || val === '--' || val === '-') return 0;
    return parseFloat(String(val).replace('%', '').replace(',', '')) / 100 || 0;
  };
  const sumCol = (rows: Row[], col: string, kind: 'number' | 'currency' | 'percent' = 'number'): number => {
    let total = 0;
    for (const row of rows) {
      if (!(col in row)) continue;
      const v = row[col];
      if (kind === 'currency') total += parseCurrency(v);
      else if (kind === 'percent') total += parsePercent(v);
      else total += parseNumber(v);
    }
    return total;
  };

  const currency = spAdvertisedRows[0]?.['Currency'] ?? businessRows[0]?.['Currency'] ?? '$';

  const adSpend = sumCol(spAdvertisedRows, 'Spend', 'currency');
  const adSales = sumCol(spAdvertisedRows, '7 Day Total Sales', 'currency');
  const adClicks = sumCol(spAdvertisedRows, 'Clicks', 'number');
  const adImpressions = sumCol(spAdvertisedRows, 'Impressions', 'number');
  const adOrders = sumCol(spAdvertisedRows, '7 Day Total Orders (#)', 'number');

  const totalStoreSales = sumCol(businessRows, 'Ordered Product Sales', 'currency');
  const sessions = sumCol(businessRows, 'Sessions – Total', 'number') + sumCol(businessRows, 'Sessions - Total', 'number');
  const unitsOrdered = sumCol(businessRows, 'Units ordered', 'number');

  // Buy Box: weighted average by sessions.
  let buyBoxNumerator = 0;
  let buyBoxDenominator = 0;
  for (const row of businessRows) {
    const sess = parseNumber(row['Sessions – Total'] ?? row['Sessions - Total']);
    const buyBox = parsePercent(row['Featured Offer (Buy Box) percentage']);
    if (sess > 0 && buyBox > 0) {
      buyBoxNumerator += buyBox * sess;
      buyBoxDenominator += sess;
    }
  }
  const buyBoxPct = buyBoxDenominator > 0 ? buyBoxNumerator / buyBoxDenominator : null;

  const acos = adSales > 0 ? (adSpend / adSales) : null;
  const roas = adSpend > 0 ? (adSales / adSpend) : null;
  const tacos = totalStoreSales > 0 ? (adSpend / totalStoreSales) : null;

  const result: AuditResult = {
    metrics: {
      totalAdSpend: adSpend,
      totalAdSales: adSales,
      totalStoreSales,
      acosPct: acos == null ? null : acos * 100,
      roas,
      tacosPct: tacos == null ? null : tacos * 100,
      clicks: adClicks,
      impressions: adImpressions,
      orders: adOrders,
      sessions,
      buyBoxPct: buyBoxPct == null ? null : buyBoxPct * 100,
      currency,
    },
    store: {
      rowCounts: {
        spAdvertised: spAdvertisedRows.length,
        spTargeting: spTargetingRows.length,
        spSearchTerm: spSearchTermRows.length,
        business: businessRows.length,
      },
    },
    verification: null,
  };

  return result;
}

