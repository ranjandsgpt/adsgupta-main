'use client';

import { useState } from 'react';

export default function AuditFeedbackPage() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/audit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, source: 'marketplace' }),
      });
    } catch {
      // Best-effort; still thank the user
    }
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <a href="/audit" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to audit
      </a>
      <h1 className="mt-6 text-2xl font-semibold text-gray-900">Audit feedback</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tell us if an insight looked wrong or if something was missing. This helps improve the shared
        Amazon audit tool.
      </p>
      {sent ? (
        <p className="mt-8 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Thanks — your feedback was submitted.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="What looked incorrect?"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Submit feedback
          </button>
        </form>
      )}
    </main>
  );
}
