import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuditBrand } from '../../brand/BrandContext';

interface HeaderProps {
  rightSlot?: ReactNode;
}

export default function Header({ rightSlot }: HeaderProps) {
  const brand = useAuditBrand();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={brand.homeHref}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="text-lg font-semibold text-[var(--color-text-muted)] text-center flex-1">
            {brand.productName}
          </h1>
          <div className="flex items-center justify-end min-w-[120px]">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
