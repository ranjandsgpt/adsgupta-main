'use client';

import { FileDown, Presentation, RotateCcw, RefreshCw } from 'lucide-react';
import { useAuditStore } from '../context/AuditStoreContext';
import { useAuditBrand } from '../../brand/BrandContext';

/** Dashboard title and actions: Rerun, Refresh exports, Download PDF, Download PPTX. */
interface DashboardTitleBarProps {
  onRerunAnalysis: () => void;
  onDownloadPdf?: () => void;
  onDownloadPptx?: () => void;
  onRefreshExports?: () => void;
  exportGenerating?: boolean;
}

export default function DashboardTitleBar({
  onRerunAnalysis,
  onDownloadPdf,
  onDownloadPptx,
  onRefreshExports,
  exportGenerating = false,
}: DashboardTitleBarProps) {
  const { state } = useAuditStore();
  const brand = useAuditBrand();
  const hasData = state.store.totalAdSpend > 0 || state.store.totalStoreSales > 0;
  const lock = exportGenerating;

  return (
    <section
      aria-label="Audit dashboard title and actions"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 sm:p-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
        {brand.productName}
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRerunAnalysis}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 font-medium text-sm hover:bg-sky-500/25 border border-sky-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="Rerun analysis"
        >
          <RotateCcw size={18} aria-hidden />
          Rerun Analysis
        </button>
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
    </section>
  );
}
