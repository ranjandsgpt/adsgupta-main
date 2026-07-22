'use client';

import { useCallback, useEffect, useState } from 'react';

type Tab = 'overview' | 'users' | 'exchange' | 'subscribers' | 'freebies' | 'payments';

type ExchangeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

type AppRole = {
  id: string;
  userId: string;
  appSlug: string;
  role: string;
  status: string;
  meta: Record<string, unknown>;
};

type CentralUser = {
  id: string;
  email: string;
  name: string | null;
  hasPassword: boolean;
  roles: AppRole[];
};

type BlogSubscriber = {
  id: string;
  email: string;
  status: string;
  source: string | null;
  createdAt: string;
};

type PendingFreebie = {
  id: string;
  user_id: string;
  status: string;
  track: string;
  profiles?: { email?: string; full_name?: string };
};

type JsonRecord = Record<string, unknown>;

/** Product tools: exchange, marketplace, blog, talentos. `platform` = hub admins only. */
const APP_SLUGS = [
  'platform',
  'exchange',
  'marketplace',
  'blog',
  'talentos',
] as const;
const ROLE_OPTIONS: Record<string, string[]> = {
  platform: ['admin', 'viewer'],
  exchange: ['admin', 'publisher', 'advertiser', 'demand'],
  marketplace: ['admin', 'user'],
  blog: ['admin', 'author'],
  // Role slot ready; TalentOS still uses its own JWT login until Phase 2 SSO.
  talentos: ['admin', 'user'],
};

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
  const [centralUsers, setCentralUsers] = useState<CentralUser[]>([]);
  const [exchangeUsers, setExchangeUsers] = useState<ExchangeUser[]>([]);
  const [subscribers, setSubscribers] = useState<BlogSubscriber[]>([]);
  const [pendingFreebies, setPendingFreebies] = useState<PendingFreebie[]>([]);
  const [payments, setPayments] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<string>('exchange');
  const [editRole, setEditRole] = useState<string>('publisher');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const [cu, ex, sub, fb, pay] = await Promise.all([
        fetchJson('/platform/api/platform/central-users'),
        fetchJson('/platform/api/platform/exchange-users'),
        fetchJson('/platform/api/platform/blog-subscribers'),
        fetchJson('/platform/api/admin/freebie/pending'),
        fetchJson('/platform/api/admin/payments'),
      ]);

      if (Array.isArray(cu.data.users)) {
        setCentralUsers(cu.data.users as CentralUser[]);
      }
      if (Array.isArray(ex.data.users)) {
        setExchangeUsers(ex.data.users as ExchangeUser[]);
      }
      if (Array.isArray(sub.data.subscribers)) {
        setSubscribers(sub.data.subscribers as BlogSubscriber[]);
      }
      if (Array.isArray(fb.data.memberships)) {
        setPendingFreebies(fb.data.memberships as PendingFreebie[]);
      }
      if (Array.isArray(pay.data.payments)) {
        setPayments(pay.data.payments as unknown[]);
      }

      const hardErrors = [
        !cu.ok ? String(cu.data.error || `Central users failed (${cu.status})`) : null,
        !ex.ok ? String(ex.data.error || `Exchange users failed (${ex.status})`) : null,
      ].filter(Boolean);
      if (hardErrors.length) setError(hardErrors[0] as string);

      const soft = [fb.data.notice, pay.data.notice, sub.data.notice]
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

  async function saveRole(user: CentralUser) {
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch('/platform/api/platform/central-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          appSlug: editApp,
          role: editRole,
          status: editStatus,
        }),
      });
      const data = (await res.json()) as JsonRecord;
      if (!res.ok) {
        setError(String(data.error || 'Failed to update role'));
      } else {
        setEditingUserId(null);
        void load();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(user: CentralUser) {
    if (!confirm(`Send password reset email to ${user.email}?`)) return;
    setBusyId(user.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/platform/api/platform/central-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reset-password', email: user.email }),
      });
      const data = (await res.json()) as JsonRecord;
      if (!res.ok) {
        setError(String(data.error || 'Reset failed'));
      } else {
        setNotice(String(data.message || 'Reset email requested.'));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function setSubscriberStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await fetch('/platform/api/platform/blog-subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      });
      void load();
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(user: CentralUser) {
    setEditingUserId(user.id);
    const first = user.roles[0];
    setEditApp(first?.appSlug || 'exchange');
    setEditRole(first?.role || 'publisher');
    setEditStatus(first?.status || 'active');
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'All users' },
    { id: 'exchange', label: 'Exchange users' },
    { id: 'subscribers', label: 'Blog subscribers' },
    { id: 'freebies', label: 'Pending freebies' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <div className="platform-admin mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AdsGupta User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tools: exchange, marketplace (incl. Amazon audit), blog, talentos. Platform is hub-admin
            only. Pousali is a brand host, not a separate tool. TalentOS SSO is Phase 2.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Central users" value={centralUsers.length} />
          <StatCard label="Exchange users" value={exchangeUsers.length} />
          <StatCard label="Blog subscribers" value={subscribers.length} />
          <StatCard label="Pending freebies" value={pendingFreebies.length} />
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">App roles</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {centralUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.name || '—'}</td>
                  <td className="px-4 py-3">{u.hasPassword ? 'Set' : 'None'}</td>
                  <td className="px-4 py-3">
                    {u.roles.length ? (
                      <ul className="space-y-1">
                        {u.roles.map((r) => (
                          <li key={r.id} className="text-xs text-gray-700">
                            <span className="font-medium">{r.appSlug}</span>: {r.role} ({r.status})
                            {typeof r.meta?.subdomain === 'string'
                              ? ` · ${r.meta.subdomain}`
                              : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">No roles</span>
                    )}
                    {editingUserId === u.id ? (
                      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3">
                        <label className="text-xs">
                          App
                          <select
                            className="mt-1 block rounded border border-gray-200 px-2 py-1"
                            value={editApp}
                            onChange={(e) => {
                              const app = e.target.value;
                              setEditApp(app);
                              setEditRole(ROLE_OPTIONS[app]?.[0] || 'user');
                            }}
                          >
                            {APP_SLUGS.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs">
                          Role
                          <select
                            className="mt-1 block rounded border border-gray-200 px-2 py-1"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            {(ROLE_OPTIONS[editApp] || ['user']).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs">
                          Status
                          <select
                            className="mt-1 block rounded border border-gray-200 px-2 py-1"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="active">active</option>
                            <option value="pending">pending</option>
                            <option value="suspended">suspended</option>
                          </select>
                        </label>
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => void saveRole(u)}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        Edit roles
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => void resetPassword(u)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Reset password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!centralUsers.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No central users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {tab === 'subscribers' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3">{s.source || '—'}</td>
                  <td className="px-4 py-3">{s.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {s.status !== 'active' ? (
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() => void setSubscriberStatus(s.id, 'active')}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() => void setSubscriberStatus(s.id, 'unsubscribed')}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!subscribers.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No blog subscribers in central store yet.
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
