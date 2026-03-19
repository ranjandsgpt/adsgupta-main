'use client';

export interface LogEntry {
  id: string;
  networkCode: string;
  bidderCode: string;
  dryRun: boolean;
  success: boolean;
  advertiserId: string | null;
  orderId: string | null;
  lineItemIds: string[];
  creativeIds: string[];
  message: string | null;
  createdAt: string;
}

export function LogViewer({ logs, onExportCsv }: { logs: LogEntry[]; onExportCsv: () => void }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Execution log</h2>
        <button
          type="button"
          onClick={onExportCsv}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Download CSV
        </button>
      </div>
      <div className="mt-4 max-h-80 overflow-auto rounded border border-slate-200">
        {logs.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No runs yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Time</th>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Network</th>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Bidder</th>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Dry run</th>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Status</th>
                <th className="border-b border-slate-200 px-3 py-2 font-medium text-slate-700">Line items</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600">{l.networkCode}</td>
                  <td className="px-3 py-2">{l.bidderCode}</td>
                  <td className="px-3 py-2">{l.dryRun ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">
                    <span className={l.success ? 'text-emerald-600' : 'text-red-600'}>
                      {l.success ? 'Success' : 'Failed'}
                    </span>
                    {l.message && <span className="ml-1 text-slate-500">({l.message})</span>}
                  </td>
                  <td className="px-3 py-2">{l.lineItemIds?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
