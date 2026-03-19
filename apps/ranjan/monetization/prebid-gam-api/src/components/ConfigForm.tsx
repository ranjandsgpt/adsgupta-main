'use client';

import { AD_SIZES } from '@/types';

const SIZES_OPTIONS = AD_SIZES.map((s) => `[${s.w}x${s.h}]`);
const GRANULARITY_OPTIONS = [0.01, 0.05, 0.1, 0.25, 0.5, 1];

export interface ConfigFormState {
  advertiserName: string;
  advertiserId: string;
  orderName: string;
  lineItemBaseName: string;
  creativeNameBase: string;
  bidderCode: string;
  kvpKeyName: string;
  hbAdidKey: string;
  hbFormatKey: string;
  hbPbGranularity: number;
  cpmMin: number;
  cpmMax: number;
  adSizes: string[];
  currency: string;
  lineItemPriority: number;
  timezone: string;
  targetingType: 'PRICE_PRIORITY' | 'STANDARD';
}

const defaultState: ConfigFormState = {
  advertiserName: '',
  advertiserId: '',
  orderName: '',
  lineItemBaseName: 'prebid_line',
  creativeNameBase: 'Prebid_Universal',
  bidderCode: '',
  kvpKeyName: 'hb_pb',
  hbAdidKey: 'hb_adid',
  hbFormatKey: 'hb_format',
  hbPbGranularity: 0.1,
  cpmMin: 0.1,
  cpmMax: 20,
  adSizes: ['[300x250]', '[336x280]', '[300x600]'],
  currency: 'USD',
  lineItemPriority: 12,
  timezone: 'America/New_York',
  targetingType: 'PRICE_PRIORITY',
};

export function ConfigForm({
  config,
  onChange,
}: {
  config: Partial<ConfigFormState>;
  onChange: (c: Partial<ConfigFormState>) => void;
}) {
  const c = { ...defaultState, ...config };
  const update = (key: keyof ConfigFormState, value: unknown) => onChange({ [key]: value });

  const toggleSize = (size: string) => {
    const next = c.adSizes.includes(size) ? c.adSizes.filter((s) => s !== size) : [...c.adSizes, size];
    update('adSizes', next);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4 sm:col-span-2">
          <h3 className="text-sm font-medium text-slate-700">Basic Info</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Advertiser Name *</label>
              <input
                value={c.advertiserName}
                onChange={(e) => update('advertiserName', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Prebid_&lt;bidder&gt;"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Advertiser ID (optional)</label>
              <input
                value={c.advertiserId}
                onChange={(e) => update('advertiserId', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Leave blank to create"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Order Name *</label>
              <input
                value={c.orderName}
                onChange={(e) => update('orderName', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="prebid_&lt;bidder&gt;"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Line Item Base Name *</label>
              <input
                value={c.lineItemBaseName}
                onChange={(e) => update('lineItemBaseName', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Creative Name Base *</label>
              <input
                value={c.creativeNameBase}
                onChange={(e) => update('creativeNameBase', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 sm:col-span-2">
          <h3 className="text-sm font-medium text-slate-700">Prebid Config</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">Bidder Code *</label>
              <input
                value={c.bidderCode}
                onChange={(e) => update('bidderCode', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. inmobi, appnexus"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">KVP Key Name (hb_pb)</label>
              <input
                value={c.kvpKeyName}
                onChange={(e) => update('kvpKeyName', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="hb_pb_inmobi"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">hb_adid key</label>
              <input
                value={c.hbAdidKey}
                onChange={(e) => update('hbAdidKey', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">hb_format key</label>
              <input
                value={c.hbFormatKey}
                onChange={(e) => update('hbFormatKey', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">CPM granularity</label>
              <select
                value={c.hbPbGranularity}
                onChange={(e) => update('hbPbGranularity', Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {GRANULARITY_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">CPM min</label>
              <input
                type="number"
                step="0.01"
                value={c.cpmMin}
                onChange={(e) => update('cpmMin', Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">CPM max</label>
              <input
                type="number"
                step="0.01"
                value={c.cpmMax}
                onChange={(e) => update('cpmMax', Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Ad Sizes</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZES_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded border px-3 py-1.5 text-xs font-medium ${
                    c.adSizes.includes(size)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4 sm:col-span-2">
          <h3 className="text-sm font-medium text-slate-700">Advanced</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">Currency</label>
              <input
                value={c.currency}
                onChange={(e) => update('currency', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Line Item Priority</label>
              <input
                type="number"
                min={1}
                value={c.lineItemPriority}
                onChange={(e) => update('lineItemPriority', Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Timezone</label>
              <input
                value={c.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Targeting type</label>
              <select
                value={c.targetingType}
                onChange={(e) => update('targetingType', e.target.value as ConfigFormState['targetingType'])}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="PRICE_PRIORITY">Price Priority</option>
                <option value="STANDARD">Standard</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
