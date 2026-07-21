'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { setAuditBrandRuntime } from './runtime';
import {
  resolveAuditBrand,
  type AuditBrandConfig,
  type AuditBrandId,
} from './types';

const AuditBrandContext = createContext<AuditBrandConfig>(resolveAuditBrand('neutral'));

export function AuditBrandProvider({
  brand = 'neutral',
  config,
  children,
}: {
  brand?: AuditBrandId | string;
  config?: Partial<AuditBrandConfig>;
  children: ReactNode;
}) {
  const resolved = useMemo(
    () => ({ ...resolveAuditBrand(brand), ...config }),
    // Host pages pass stable brand; stringify keeps optional overrides honest
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, JSON.stringify(config ?? {})]
  );

  useEffect(() => {
    setAuditBrandRuntime(resolved);
  }, [resolved]);

  return (
    <AuditBrandContext.Provider value={resolved}>{children}</AuditBrandContext.Provider>
  );
}

export function useAuditBrand(): AuditBrandConfig {
  return useContext(AuditBrandContext);
}
