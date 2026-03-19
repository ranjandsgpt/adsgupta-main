'use client';

import type { CpmBucket } from '@/types';

export function CpmPreview({ buckets }: { buckets: CpmBucket[] }) {
  if (buckets.length === 0) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">CPM preview</h2>
      <p className="mt-1 text-sm text-slate-500">{buckets.length} line items will be created.</p>
      <div className="mt-4 max-h-64 overflow-auto rounded border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-4 py-2 font-medium text-slate-700">Price (CPM)</th>
              <th className="border-b border-slate-200 px-4 py-2 font-medium text-slate-700">Line item name</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-4 py-2 font-mono">{b.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-slate-600">{b.lineItemName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
