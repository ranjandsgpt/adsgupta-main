'use client';

import { useEffect, useState } from 'react';
import { Footer } from '@adsgupta/ui';

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={classNames(
        'sticky top-0 z-50 w-full bg-white/90 backdrop-blur',
        scrolled && 'border-b border-gray-200'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="text-sm font-semibold text-gray-900">
          Marketplace <span className="font-normal text-gray-500">by AdsGupta</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#tools" className="text-sm text-gray-600 hover:text-gray-900">
            Tools
          </a>
          <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">
            About
          </a>
          <a
            href="https://adsgupta.com/blog"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Blog↗
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/signin"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:inline-flex"
          >
            Sign in
          </a>
          <a
            href="/audit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start free →
          </a>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] text-white">
      <div className="absolute inset-0">
        <div className="hero-orb absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
            AI-Powered Amazon Intelligence
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-tight sm:text-[56px]">
            Outperform Every Competitor on Amazon
          </h1>
          <p className="mt-6 text-lg text-gray-400 sm:text-xl">
            Real-time ROAS optimization, automated bid management, and deep catalog intelligence. Built for agencies
            managing $1M+ in ad spend.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/audit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Run Free Audit →
            </a>
            <a
              href="/book-demo"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Book Demo
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-white/10 lg:border-r lg:pr-6">
            <div className="text-2xl font-bold">$2.4B+</div>
            <div className="mt-1 text-sm text-gray-400">Ad Spend Managed</div>
          </div>
          <div className="border-white/10 lg:border-r lg:px-6">
            <div className="text-2xl font-bold">3.8x</div>
            <div className="mt-1 text-sm text-gray-400">Avg ROAS Improvement</div>
          </div>
          <div className="border-white/10 lg:border-r lg:px-6">
            <div className="text-2xl font-bold">48hrs</div>
            <div className="mt-1 text-sm text-gray-400">Time to First Optimization</div>
          </div>
          <div className="lg:pl-6">
            <div className="text-2xl font-bold">500+</div>
            <div className="mt-1 text-sm text-gray-400">Brands Optimized</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-orb {
          background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.9), rgba(168, 85, 247, 0.35), transparent 70%);
          animation: orbMove 10s ease-in-out infinite;
        }
        @keyframes orbMove {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-46%, -54%) scale(1.06);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </section>
  );
}

function ToolCard({ emoji, title, desc, href }: { emoji: string; title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">{emoji}</div>
      <div className="mt-4 text-base font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-500">{desc}</div>
      <div className="mt-4 text-sm font-semibold text-blue-600">Learn more →</div>
    </a>
  );
}

function Tools() {
  return (
    <section id="tools" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600">PLATFORM</div>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">Everything your agency needs</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ToolCard emoji="🔍" title="Amazon Audit Tool" desc="Deep-dive account health check in 60 seconds" href="/audit" />
          <ToolCard emoji="📊" title="ROAS Optimizer" desc="AI-driven bid adjustments that compound daily" href="/tools/roas" />
          <ToolCard emoji="🎯" title="Keyword Intelligence" desc="Find keywords competitors are hiding from you" href="/tools/keywords" />
          <ToolCard emoji="📦" title="Catalog Intelligence" desc="SKU-level profitability and content scoring" href="/tools/catalog" />
          <ToolCard emoji="🤖" title="Auto Campaign Builder" desc="Structure campaigns the right way, automatically" href="/tools/campaigns" />
          <ToolCard emoji="📈" title="Dayparting Engine" desc="Serve ads when buyers buy, pause when they don't" href="/tools/dayparting" />
        </div>
      </div>
    </section>
  );
}

function ProofCard({
  metric,
  category,
  spend,
  quote,
}: {
  metric: string;
  category: string;
  spend: string;
  quote: string;
}) {
  return (
    <div className="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-sm">
      <div className="text-2xl font-bold text-blue-600">{metric}</div>
      <div className="mt-3 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
        {category}
      </div>
      <div className="mt-2 text-xs text-gray-500">{spend}</div>
      <div className="mt-4 text-sm italic text-gray-600">"{quote}"</div>
    </div>
  );
}

function SocialProof() {
  return (
    <section className="bg-[#F9FAFB] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Agencies that switched from Teikametrics</h2>
          <p className="mt-4 text-lg text-gray-500">Real results. Anonymous brands. Verified data.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProofCard
            metric="4.2x ROAS in 90 days"
            category="Beauty & Personal Care"
            spend="$180K/mo ad spend"
            quote="Restructured 14 campaigns and eliminated $32K in wasted monthly spend within 6 weeks"
          />
          <ProofCard
            metric="62% ACoS reduction"
            category="Consumer Electronics"
            spend="$420K/mo ad spend"
            quote="Keyword harvesting combined with dayparting cut ACoS from 41% down to 16% in Q1"
          />
          <ProofCard
            metric="3x revenue growth"
            category="Apparel & Fashion"
            spend="$95K/mo ad spend"
            quote="Auto campaign builder discovered 2,800 profitable exact match keywords in the first week"
          />
        </div>
      </div>
    </section>
  );
}

function HowStep({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="relative flex-1">
      <div className="text-5xl font-bold text-blue-600">{n}</div>
      <div className="mt-3 text-base font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-500">{desc}</div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">From connected to optimized in 48 hours</h2>
        </div>
        <div className="relative mt-12">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gray-200 md:block" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <HowStep
              n="01"
              title="Connect"
              desc="Link Amazon Seller Central or Vendor Central. Read-only access, no risk, 2 minutes."
            />
            <HowStep
              n="02"
              title="Audit"
              desc="AI analyzes 200+ data points across your catalog, campaigns, and keywords in seconds."
            />
            <HowStep
              n="03"
              title="Optimize"
              desc="Automated bid adjustments, keyword harvesting, and pacing changes start immediately."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  badge,
  highlight,
  features,
}: {
  name: string;
  price: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
}) {
  return (
    <div
      className={classNames(
        'relative rounded-2xl border bg-white/5 p-8 text-white',
        highlight ? 'border-2 border-blue-500' : 'border-white/10'
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
          {badge}
        </div>
      )}
      <div className="text-lg font-semibold">{name}</div>
      <div className="mt-3 text-3xl font-bold">{price}</div>
      <ul className="mt-6 space-y-3 text-sm text-gray-200">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-blue-400">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="/audit"
        className={classNames(
          'mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold',
          highlight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 hover:bg-white/15'
        )}
      >
        Start free
      </a>
    </div>
  );
}

function Pricing() {
  return (
    <section className="bg-[#0A0A0A] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-gray-400">No contracts. Cancel anytime. 14-day free trial on all plans.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            name="Starter"
            price="$299/mo"
            features={['Up to $50K ad spend', '1 marketplace', 'Audit tool', 'ROAS dashboard', 'Email support']}
          />
          <PricingCard
            name="Growth"
            price="$799/mo"
            badge="Most Popular"
            highlight
            features={[
              'Up to $250K ad spend',
              '3 marketplaces',
              'Everything in Starter',
              'ROAS Optimizer',
              'Keyword Intelligence',
              'Catalog Intelligence',
              'Priority support',
            ]}
          />
          <PricingCard
            name="Agency"
            price="$1,999/mo"
            features={[
              'Unlimited ad spend',
              'All marketplaces',
              'Everything in Growth',
              'White-label reports',
              'Dedicated CSM',
              'API access',
              'Custom integrations',
            ]}
          />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Tools />
      <SocialProof />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}

