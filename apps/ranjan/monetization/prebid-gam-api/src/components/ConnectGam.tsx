'use client';

export function ConnectGam({
  networkCode,
  onNetworkCodeChange,
  connected,
  onConnect,
}: {
  networkCode: string;
  onNetworkCodeChange: (v: string) => void;
  connected: boolean;
  onConnect: () => void;
}) {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const connectUrl = `${base}/api/auth/gam/connect?networkCode=${encodeURIComponent(networkCode)}`;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Connect GAM</h2>
      <p className="mt-1 text-sm text-slate-500">Enter your GAM Network Code and authenticate with Google.</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Network Code</label>
          <input
            type="text"
            value={networkCode}
            onChange={(e) => onNetworkCodeChange(e.target.value)}
            placeholder="12345678"
            className="mt-1 w-48 rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {connected ? (
          <span className="rounded bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800">Connected</span>
        ) : (
          <a
            href={connectUrl}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect via Google OAuth
          </a>
        )}
      </div>
    </section>
  );
}
