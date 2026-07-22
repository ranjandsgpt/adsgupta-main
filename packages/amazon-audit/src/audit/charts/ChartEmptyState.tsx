'use client';

/** Consistent empty state for audit charts (avoids blank grid holes). */
export default function ChartEmptyState({ message = 'No data for this chart yet. Upload advertising reports to populate it.' }: { message?: string }) {
  return (
    <div className="audit-empty-state rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 min-h-[160px]">
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
