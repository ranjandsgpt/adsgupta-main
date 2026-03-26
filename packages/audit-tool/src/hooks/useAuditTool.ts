'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { AuditFile, AuditResult } from '../lib/audit-types';
import { runAuditProcessor } from '../lib/audit-processor';

export type AuditStep = 'upload' | 'processing' | 'results' | 'error';

export interface UseAuditToolState {
  step: AuditStep;
  files: AuditFile[];
  result: AuditResult | null;
  error: string | null;
}

export function useAuditTool(options?: { apiBaseUrl?: string }) {
  const [state, setState] = useState<UseAuditToolState>({
    step: 'upload',
    files: [],
    result: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ step: 'upload', files: [], result: null, error: null });
  }, []);

  const start = useCallback(
    async (files: AuditFile[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({ ...s, step: 'processing', files, error: null, result: null }));
      try {
        const result = await runAuditProcessor(files, {
          apiBaseUrl: options?.apiBaseUrl,
          signal: controller.signal,
        });
        setState((s) => ({ ...s, step: 'results', result }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setState((s) => ({ ...s, step: 'error', error: msg }));
      }
    },
    [options?.apiBaseUrl]
  );

  const actions = useMemo(() => ({ reset, start }), [reset, start]);
  return { ...state, ...actions };
}

