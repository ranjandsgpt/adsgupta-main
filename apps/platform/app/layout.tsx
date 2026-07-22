import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdsGupta Platform — Sign in & User Management',
  description: 'Central login and access management for the AdsGupta network.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
