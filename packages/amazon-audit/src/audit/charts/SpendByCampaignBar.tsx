'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuditStore } from '../context/AuditStoreContext';
import ChartEmptyState from './ChartEmptyState';

export default function SpendByCampaignBar() {
  const { state } = useAuditStore();
  const data = useMemo(() => {
    return Object.values(state.store.campaignMetrics)
      .filter((m) => m.campaignName)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
      .map((m) => ({ name: m.campaignName.length > 12 ? m.campaignName.slice(0, 12) + '…' : m.campaignName, spend: m.spend }));
  }, [state.store.campaignMetrics]);

  if (data.length === 0) {
    return <ChartEmptyState message="No campaign spend data yet." />;
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">Spend by Campaign (Top 10)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
          <YAxis type="category" dataKey="name" width={80} stroke="var(--color-text-muted)" fontSize={10} />
          <Tooltip formatter={(v: number) => v.toFixed(2)} />
          <Bar dataKey="spend" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
