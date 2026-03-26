'use client';

export default function AuditLoading({ title = 'Processing your reports…' }: { title?: string }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-8">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-blue-100" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-sm text-gray-500">This usually takes under a minute.</div>
        </div>
      </div>
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
      </div>
    </div>
  );
}

