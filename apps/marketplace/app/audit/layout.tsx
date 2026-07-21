import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amazon Advertising Audit | Marketplace by AdsGupta',
  description:
    'Free Amazon advertising audit tool for agencies. TACOS, ROAS, bleeders, and ASIN-level profitability.',
  alternates: {
    canonical: 'https://marketplace.adsgupta.com/audit',
  },
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
