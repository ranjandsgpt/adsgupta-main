import { AuditTool } from '@adsgupta/audit-tool';

export const metadata = {
  title: 'Free Amazon Advertising Audit — Marketplace by AdsGupta',
  description:
    'Deep-dive Amazon account health check in 60 seconds. Upload your SP, SB, SD, and Business Report data.',
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Free Tool
          </span>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Amazon Advertising Audit</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Upload your Amazon report exports and get a complete performance breakdown — ACoS, ROAS, TACoS, bleeders,
            and profit leakage — in under a minute.
          </p>
        </div>
        <AuditTool />
      </div>
    </main>
  );
}

