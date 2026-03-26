'use client';

export default function AuditError({
  error,
  onReset,
}: {
  error: string;
  onReset?: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8">
      <div className="text-sm font-semibold text-red-900">Something went wrong</div>
      <div className="mt-2 text-sm text-red-800">{error}</div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Start over
        </button>
      )}
    </div>
  );
}

