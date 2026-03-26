'use client';

export default function AuditHero({
  title = 'Amazon Advertising Audit',
  subtitle = 'Upload your report exports and get a complete performance breakdown in under a minute.',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 text-center">
      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        Free Tool
      </span>
      <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">{subtitle}</p>
    </div>
  );
}

