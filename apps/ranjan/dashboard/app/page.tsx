'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EXCHANGE_API_URL =
  process.env.NEXT_PUBLIC_EXCHANGE_API_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_API_KEY || '';

interface AuctionRow {
  auctionId: string;
  timestamp: number;
  publisherId: string;
  requestCount: number;
  fillCount: number;
  totalRevenue: number;
  latencyMs: number;
  winnerDsp: string | null;
  bidCount: number;
}

interface OverviewMetrics {
  total_requests: number;
  total_fills: number;
  fill_rate: number;
  auctions_last_hour: number;
  avg_latency_ms: number;
  total_revenue_cpm?: number;
}

function useExchangeData(demoMode: boolean) {
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) return;

    const headers: Record<string, string> = {};
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const fetchAll = async () => {
      try {
        const [auctionsRes, overviewRes, statusRes] = await Promise.all([
          fetch(`${EXCHANGE_API_URL}/api/auctions?limit=50`, { headers }),
          fetch(`${EXCHANGE_API_URL}/api/analytics/overview`, { headers }),
          fetch(`${EXCHANGE_API_URL}/status`),
        ]);

        if (auctionsRes.ok) {
          const data = await auctionsRes.json();
          setAuctions(data.auctions || []);
        }
        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setOverview(data);
        }
        if (statusRes.ok) {
          const data = await statusRes.json();
          setStatus(data);
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch');
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, [demoMode]);

  return { auctions, overview, status, error };
}

function generateDemoData() {
  const now = Date.now();
  const auctions: AuctionRow[] = [];
  for (let i = 0; i < 30; i++) {
    const fill = Math.random() > 0.25;
    auctions.push({
      auctionId: `demo-${now - i * 4000}-${i}`,
      timestamp: now - i * 4000,
      publisherId: i % 2 === 0 ? 'demo_pub' : 'pub_2',
      requestCount: 1,
      fillCount: fill ? 1 : 0,
      totalRevenue: fill ? 0.3 + Math.random() * 1.5 : 0,
      latencyMs: 40 + Math.floor(Math.random() * 60),
      winnerDsp: fill ? (i % 3 === 0 ? 'test_bidder' : 'DSP Alpha') : null,
      bidCount: fill ? 2 + Math.floor(Math.random() * 2) : 0,
    });
  }
  const totalRevenueCpm = auctions.reduce((s, a) => s + a.totalRevenue, 0);
  const totalFills = auctions.filter((a) => a.fillCount > 0).length;
  const overview: OverviewMetrics = {
    total_requests: 30,
    total_fills: totalFills,
    fill_rate: Math.round((totalFills / 30) * 1000) / 10,
    auctions_last_hour: 30,
    avg_latency_ms: 72,
    total_revenue_cpm: totalRevenueCpm,
  };
  return { auctions, overview };
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = (now - ts) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return d.toLocaleTimeString();
}

export default function DashboardPage() {
  const [demoMode, setDemoMode] = useState(true);

  const live = useExchangeData(demoMode);
  const demo = generateDemoData();

  const auctions = demoMode ? demo.auctions : live.auctions;
  const overview = demoMode ? demo.overview : live.overview;
  const status = live.status;

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-xl font-semibold text-white">
          AdsGupta Exchange Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-positive focus:ring-positive"
            />
            Demo mode
          </label>
          {!demoMode && live.error && (
            <span className="text-alert text-sm">{live.error}</span>
          )}
        </div>
      </header>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue (CPM sum)"
          value={
            overview?.total_revenue_cpm != null
              ? `$${(overview.total_revenue_cpm / 1000).toFixed(2)}`
              : '—'
          }
          sub="CPM/1000 × fills"
        />
        <StatCard
          label="Total requests"
          value={overview?.total_requests ?? '—'}
          sub={status ? `${status.auctions_last_hour} auctions/hour` : undefined}
        />
        <StatCard
          label="Fill rate"
          value={
            overview?.fill_rate != null ? `${overview.fill_rate}%` : '—'
          }
          sub=""
        />
        <StatCard
          label="Avg latency"
          value={
            overview?.avg_latency_ms != null
              ? `${overview.avg_latency_ms} ms`
              : '—'
          }
          sub=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live auction feed */}
        <div className="lg:col-span-2 bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="font-medium text-white">Live auction feed</h2>
            <p className="text-xs text-muted mt-0.5">
              Last 50 auctions · {demoMode ? 'simulated' : 'live'}
            </p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm font-mono">
              <thead className="sticky top-0 bg-gray-900 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Auction ID</th>
                  <th className="px-4 py-2">Publisher</th>
                  <th className="px-4 py-2">Bids</th>
                  <th className="px-4 py-2">Winner</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Latency</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr
                    key={a.auctionId}
                    className="border-t border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-2 text-muted font-mono-num">
                      {formatTime(a.timestamp)}
                    </td>
                    <td className="px-4 py-2 truncate max-w-[120px]" title={a.auctionId}>
                      {a.auctionId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-2">{a.publisherId}</td>
                    <td className="px-4 py-2 font-mono-num">{a.bidCount}</td>
                    <td className="px-4 py-2 text-positive">
                      {a.winnerDsp ?? '—'}
                    </td>
                    <td className="px-4 py-2 font-mono-num text-neutral">
                      {a.totalRevenue > 0
                        ? `$${a.totalRevenue.toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 font-mono-num">{a.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DSP health */}
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="font-medium text-white">DSP health</h2>
          </div>
          <div className="p-4 space-y-3">
            <DSPRow
              name="Test Bidder"
              status="healthy"
              avgLatency={overview?.avg_latency_ms ?? 0}
              bidRate={overview?.fill_rate ?? 0}
            />
            {demoMode && (
              <>
                <DSPRow
                  name="DSP Alpha"
                  status="healthy"
                  avgLatency={65}
                  bidRate={68}
                />
                <DSPRow
                  name="DSP Beta"
                  status="degraded"
                  avgLatency={95}
                  bidRate={45}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div className="mt-6 bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="font-medium text-white">Revenue (last 24h)</h2>
          <p className="text-xs text-muted mt-0.5">Hourly buckets · demo data</p>
        </div>
        <div className="p-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={Array.from({ length: 24 }, (_, i) => ({
                hour: `${24 - i}h`,
                revenue: 0.5 + Math.random() * 2,
                requests: 20 + Math.floor(Math.random() * 80),
              })).reverse()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#00ff88' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-mono font-semibold text-white font-mono-num">
        {value}
      </p>
      {sub != null && sub !== '' && (
        <p className="mt-0.5 text-xs text-muted">{sub}</p>
      )}
    </div>
  );
}

function DSPRow({
  name,
  status,
  avgLatency,
  bidRate,
}: {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  avgLatency: number;
  bidRate: number;
}) {
  const dot =
    status === 'healthy'
      ? 'bg-positive'
      : status === 'degraded'
        ? 'bg-yellow-500'
        : 'bg-alert';
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-white">{name}</span>
      </div>
      <div className="text-muted font-mono text-xs">
        {avgLatency}ms · {bidRate}% bid
      </div>
    </div>
  );
}
