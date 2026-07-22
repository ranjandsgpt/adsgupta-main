'use client';

import { useCallback, useEffect, useState } from 'react';

type Tab = 'overview' | 'exchange' | 'freebies' | 'payments';

type ExchangeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

type PendingFreebie = {
  id: string;
  user_id: string;
  status: string;
  track: string;
  profiles?: { email?: string; full_name?: string };
};

type JsonRecord = Record<string, unknown>;

async function fetchJson(url: string): Promise<{
  ok: boolean;
  status: number;
  data: JsonRecord;
}> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    const text = await res.text();
    if (!text) {
      return {
        ok: false,
        status: res.status,
        data: { error: `Empty response (${res.status})` },
      };
    }
    try {
      const data = JSON.parse(text) as JsonRecord;
      return { ok: res.ok, status: res.status, data };
    } catch {
      return {
        ok: false,
        status: res.status,
        data: { error: `Invalid JSON (${res.status})` },
      };
    }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: { error: e instanceof Error ? e.message : 'Network error' },
    };
  }
}

export function PlatformAdminConsole() {
  const [tab, setTab] = useState<Tab>('overview');
  const [exchangeUsers, setExchangeUsers] = useState<ExchangeUser[]>([]);
  const [pendingFreebies, setPendingFreebies] = useState<PendingFreebie[]>([]);
  const [payments, setPayments] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const [ex, fb, pay] = await Promise.all([
        fetchJson('/platform/api/platform/exchange-users'),
        fetchJson('/platform/api/admin/freebie/pending'),
        fetchJson('/platform/api/admin/payments'),
      ]);

      if (Array.isArray(ex.data.users)) {
        setExchangeUsers(ex.data.users as ExchangeUser[]);
      }
      if (Array.isArray(fb.data.memberships)) {
        setPendingFreebies(fb.data.memberships as PendingFreebie[]);
      }
      if (Array.isArray(pay.data.payments)) {
        setPayments(pay.data.payments as unknown[]);
      }

      if (!ex.ok) {
        setError(String(ex.data.error || `Exchange users failed (${ex.status})`));
      }

      const soft = [fb.data.notice, pay.data.notice]
        .filter((n): n is string => typeof n === 'string' && n.length > 0);
      if (soft.length) setNotice(soft[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    void load();
  }, [load]);

  async function approveFreebie(id: string) {
    await fetch('/platform/api/admin/freebie/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ membership_id: id }),
    });
    void load();
  }

  async function rejectFreebie(id: string) {
    await fetch('/platform/api/admin/freebie/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ membership_id: id }),
    });
    void load();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'exchange', label: 'Exchange users' },
    { id: 'freebies', label: 'Pending freebies' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <div className="platform-admin mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AdsGupta User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Subscribers, freebies, and access across marketplace, exchange, and blog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {notice ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Exchange users" value={exchangeUsers.length} />
          <StatCard label="Pending freebies" value={pendingFreebies.length} />
          <StatCard label="Payments" value={payments.length} />
        </div>
      )}

      {tab === 'exchange' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {exchangeUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.status}</td>
                </tr>
              ))}
              {!exchangeUsers.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No exchange users (or DB not linked).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'freebies' && (
        <div className="space-y-3">
          {pendingFreebies.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {(m as { profile?: { full_name?: string; email?: string } }).profile
                    ?.full_name ||
                    (m as { profile?: { email?: string } }).profile?.email ||
                    m.user_id}
                </p>
                <p className="text-sm text-gray-500">
                  {(m as { profile?: { email?: string } }).profile?.email}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void approveFreebie(m.id)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void rejectFreebie(m.id)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!pendingFreebies.length && (
            <p className="text-center text-sm text-gray-500">No pending freebie requests.</p>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs">
          {JSON.stringify(payments, null, 2) || '[]'}
        </pre>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
