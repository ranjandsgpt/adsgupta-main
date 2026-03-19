import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Exchange Dashboard | AdsGupta',
  description: 'Real-time OpenRTB exchange dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans antialiased bg-[#0a0a0a] text-gray-200">
        {children}
      </body>
    </html>
  );
}
