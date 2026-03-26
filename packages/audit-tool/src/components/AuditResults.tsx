'use client';

import type { AuditResult } from '../lib/audit-types';

function metric(label: string, value: string) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default function AuditResults({ result, onReset }: { result: AuditResult; onReset?: () => void }) {
  const m = result.metrics;
  const currency = m.currency ?? '$';
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metric('Ad Spend', `${currency}${m.totalAdSpend.toFixed(2)}`)}
        {metric('Ad Sales', `${currency}${m.totalAdSales.toFixed(2)}`)}
        {metric('Total Sales', `${currency}${m.totalStoreSales.toFixed(2)}`)}
        {metric('ROAS', m.roas == null ? '—' : `${m.roas.toFixed(2)}×`)}
        {metric('ACoS', m.acosPct == null ? '—' : `${m.acosPct.toFixed(1)}%`)}
        {metric('TACoS', m.tacosPct == null ? '—' : `${m.tacosPct.toFixed(1)}%`)}
        {metric('Clicks', m.clicks.toLocaleString())}
        {metric('Impressions', m.impressions.toLocaleString())}
      </div>

      {onReset && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Run another audit
          </button>
        </div>
      )}
    </div>
  );
}

