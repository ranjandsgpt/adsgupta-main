import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amazon Advertising Performance Audit',
  description:
    'Transform Amazon CSV exports into a One-Sheet audit. TACOS, Bleeders, ASIN-level profitability.',
  alternates: {
    canonical: 'https://pousali.adsgupta.com/audit',
  },
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
