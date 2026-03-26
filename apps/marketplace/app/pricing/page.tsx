export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-4 text-lg text-gray-400">No contracts. Cancel anytime. 14-day free trial on all plans.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-lg font-semibold">Starter</div>
            <div className="mt-3 text-3xl font-bold">$299/mo</div>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li>✓ Up to $50K ad spend</li>
              <li>✓ 1 marketplace</li>
              <li>✓ Audit tool</li>
              <li>✓ ROAS dashboard</li>
              <li>✓ Email support</li>
            </ul>
            <a
              href="/audit"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
            >
              Start free
            </a>
          </div>

          <div className="relative rounded-2xl border-2 border-blue-500 bg-white/5 p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
              Most Popular
            </div>
            <div className="text-lg font-semibold">Growth</div>
            <div className="mt-3 text-3xl font-bold">$799/mo</div>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li>✓ Up to $250K ad spend</li>
              <li>✓ 3 marketplaces</li>
              <li>✓ Everything in Starter</li>
              <li>✓ ROAS Optimizer</li>
              <li>✓ Keyword Intelligence</li>
              <li>✓ Catalog Intelligence</li>
              <li>✓ Priority support</li>
            </ul>
            <a
              href="/audit"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start free
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-lg font-semibold">Agency</div>
            <div className="mt-3 text-3xl font-bold">$1,999/mo</div>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li>✓ Unlimited ad spend</li>
              <li>✓ All marketplaces</li>
              <li>✓ Everything in Growth</li>
              <li>✓ White-label reports</li>
              <li>✓ Dedicated CSM</li>
              <li>✓ API access</li>
              <li>✓ Custom integrations</li>
            </ul>
            <a
              href="/audit"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
            >
              Start free
            </a>
          </div>
        </div>

        <a href="/" className="mt-12 inline-block text-sm font-semibold text-blue-400">
          ← Back to home
        </a>
      </div>
    </main>
  );
}

