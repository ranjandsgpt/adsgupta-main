'use client';

import { useCallback, useEffect, useState } from 'react';
import { ConnectGam } from '@/components/ConnectGam';
import { ConfigForm, type ConfigFormState } from '@/components/ConfigForm';
import { CpmPreview } from '@/components/CpmPreview';
import { LogViewer, type LogEntry } from '@/components/LogViewer';
import type { CpmBucket } from '@/types';

export default function PrebidGamPage() {
  const [networkCode, setNetworkCode] = useState('');
  const [gamConnected, setGamConnected] = useState(false);
  const [config, setConfig] = useState<Partial<ConfigFormState>>({});
  const [cpmBuckets, setCpmBuckets] = useState<CpmBucket[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gam_connected') === '1') setGamConnected(true);
    const nc = params.get('networkCode');
    if (nc) setNetworkCode(nc);
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const q = networkCode ? `?networkCode=${encodeURIComponent(networkCode)}` : '';
      const res = await fetch(`/api/logs${q}`);
      if (res.ok) setLogs(await res.json());
    } catch {
      setLogs([]);
    }
  }, [networkCode]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const refreshPreview = useCallback(async () => {
    const c = config as ConfigFormState;
    if (c.cpmMin == null || c.cpmMax == null || c.hbPbGranularity == null) return;
    try {
      const res = await fetch('/api/cpm-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpmMin: c.cpmMin,
          cpmMax: c.cpmMax,
          granularity: c.hbPbGranularity,
          bidderCode: c.bidderCode || 'bidder',
          lineItemBaseName: c.lineItemBaseName || 'prebid_line',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCpmBuckets(data.buckets || []);
      }
    } catch {
      setCpmBuckets([]);
    }
  }, [config]);

  useEffect(() => {
    refreshPreview();
  }, [config?.cpmMin, config?.cpmMax, config?.hbPbGranularity, config?.bidderCode, config?.lineItemBaseName, refreshPreview]);

  const handleGenerate = async () => {
    if (!networkCode.trim()) {
      setLastResult({ success: false, message: 'Enter GAM Network Code and connect.' });
      return;
    }
    const c = config as ConfigFormState;
    if (!c.bidderCode?.trim() || !c.advertiserName?.trim() || !c.orderName?.trim()) {
      setLastResult({ success: false, message: 'Fill required fields: Advertiser name, Order name, Bidder code.' });
      return;
    }
    setRunning(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkCode: networkCode.trim(),
          dryRun,
          config: {
            advertiserName: c.advertiserName,
            advertiserId: c.advertiserId || undefined,
            orderName: c.orderName,
            lineItemBaseName: c.lineItemBaseName || 'prebid_line',
            creativeNameBase: c.creativeNameBase || 'Prebid_Universal',
            bidderCode: c.bidderCode,
            kvpKeyName: c.kvpKeyName || 'hb_pb',
            hbAdidKey: c.hbAdidKey || 'hb_adid',
            hbFormatKey: c.hbFormatKey || 'hb_format',
            hbPbGranularity: c.hbPbGranularity ?? 0.1,
            cpmMin: c.cpmMin ?? 0.1,
            cpmMax: c.cpmMax ?? 20,
            adSizes: c.adSizes || [],
            currency: c.currency || 'USD',
            lineItemPriority: c.lineItemPriority ?? 12,
            timezone: c.timezone || 'America/New_York',
            targetingType: c.targetingType || 'PRICE_PRIORITY',
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLastResult({ success: false, message: data.error || 'Request failed' });
        return;
      }
      setLastResult({ success: data.success, message: data.message });
      loadLogs();
    } finally {
      setRunning(false);
    }
  };

  const exportCsv = useCallback(() => {
    const headers = ['id', 'networkCode', 'bidderCode', 'dryRun', 'success', 'advertiserId', 'orderId', 'lineItemCount', 'creativeCount', 'createdAt'];
    const rows = logs.map((l) => [
      l.id,
      l.networkCode,
      l.bidderCode,
      l.dryRun,
      l.success,
      l.advertiserId ?? '',
      l.orderId ?? '',
      (l.lineItemIds?.length ?? 0).toString(),
      (l.creativeIds?.length ?? 0).toString(),
      l.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prebid-gam-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Prebid GAM API</h1>
        <p className="mt-1 text-slate-600">Automate Prebid line item setup in Google Ad Manager.</p>
      </div>

      <div className="space-y-6">
        <ConnectGam
          networkCode={networkCode}
          onNetworkCodeChange={setNetworkCode}
          connected={gamConnected}
          onConnect={() => {}}
        />
        <ConfigForm config={config} onChange={(c) => setConfig((prev) => ({ ...prev, ...c }))} />
        <CpmPreview buckets={cpmBuckets} />

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Dry run (preview only, no GAM changes)</span>
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={running}
              className="rounded bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {running ? 'Running…' : 'Generate Setup'}
            </button>
          </div>
          {lastResult && (
            <p className={`mt-3 text-sm ${lastResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {lastResult.success ? 'Setup completed.' : lastResult.message}
            </p>
          )}
        </section>

        <LogViewer logs={logs} onExportCsv={exportCsv} />
      </div>
    </main>
  );
}
