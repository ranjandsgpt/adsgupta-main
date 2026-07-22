'use client';

import { useMemo } from 'react';
import { FileDown, Presentation, RefreshCw } from 'lucide-react';
import { useAuditStore } from '../context/AuditStoreContext';
import { runDataTrustAgent } from '@adsgupta/amazon-audit/agents/dataTrustAgent';

/** Bottom export bar: PDF, PPTX, Refresh. Phase 40: progress bar. */
interface ExportBarProps {
  onDownloadPdf?: () => void;
  onDownloadPptx?: () => void;
  onRefreshExports?: () => void;
  exportGenerating?: boolean;
  /** Phase 40: status for progress bar */
  exportStatus?: 'idle' | 'queued' | 'rendering' | 'verifying' | 'retrying' | 'ready' | 'error';
  exportStatusMessage?: string;
  exportError?: string | null;
  /** When true, show note that charts/PDF used deterministic fallback */
  chartsFallbackUsed?: boolean;
}

const STATUS_PCT: Record<string, number> = {
  idle: 0,
  queued: 15,
  rendering: 45,
  verifying: 80,
  retrying: 65,
  ready: 100,
  error: 100,
};

export default function ExportBar({
  onDownloadPdf,
  onDownloadPptx,
  onRefreshExports,
  exportGenerating = false,
  exportStatus = 'idle',
  exportStatusMessage = '',
  exportError = null,
  chartsFallbackUsed = false,
}: ExportBarProps) {
  const { state } = useAuditStore();
  const store = state.store;
  const hasData = store.totalAdSpend > 0 || (store.totalStoreSales ?? store.storeMetrics?.totalSales ?? 0) > 0;
  const lock = exportGenerating;
  const pct = STATUS_PCT[exportStatus] ?? 0;
  const dataTrust = useMemo(() => (hasData ? runDataTrustAgent(store) : null), [hasData, store]);

  return (
    <section
      aria-label="Export report"
      className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {lock ? (exportStatusMessage || 'Generating premium report…') : 'Export Report (PDF & PPTX)'}
        {chartsFallbackUsed && !lock && (
          <span className="ml-2 text-xs font-normal text-amber-400/90" title="Charts or PDF were generated using deterministic fallback (Python engine unavailable)">
            (Charts/PDF: deterministic fallback)
          </span>
        )}
        {dataTrust != null && (
          <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]" title="Data trust score">
            Audit Confidence: {Math.round(dataTrust.trustScore * 100)}%
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        {onRefreshExports && (
          <button
            type="button"
            onClick={onRefreshExports}
            disabled={!hasData || lock}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium text-sm hover:text-[var(--color-text)] border border-[var(--color-border)] disabled:opacity-50"
            aria-label="Refresh exports"
            title="Regenerate premium report"
          >
            <RefreshCw size={18} className={lock ? 'animate-spin' : ''} aria-hidden />
            Refresh
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={!hasData || lock}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/25"
          aria-label="Download PDF"
        >
          <FileDown size={18} aria-hidden />
          Download PDF
        </button>
        <button
          type="button"
          onClick={onDownloadPptx}
          disabled={!hasData || lock}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/25"
          aria-label="Download PPTX"
        >
          <Presentation size={18} aria-hidden />
          Download PPTX
        </button>
      </div>
      </div>
      {lock && (
        <div className="w-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-amber-500/80 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      {exportError && !lock && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
          role="alert"
          aria-live="polite"
        >
          <p className="font-semibold text-red-400">Export failed</p>
          <p className="mt-1 text-red-300/90">
            <span className="text-[var(--color-text-muted)]">Reason:</span> {exportError}
          </p>
          <p className="mt-2 text-amber-200/90">
            <span className="text-[var(--color-text-muted)]">Suggestion:</span> Click Refresh to regenerate report, then try Download again.
          </p>
        </div>
      )}
    </section>
  );
}
