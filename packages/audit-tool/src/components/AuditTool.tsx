'use client';

import AuditError from './AuditError';
import AuditHero from './AuditHero';
import AuditLoading from './AuditLoading';
import AuditResults from './AuditResults';
import AuditUploader from './AuditUploader';
import { AUDIT_DEFAULT_MAX_TOTAL_BYTES } from '../lib/audit-constants';
import { useAuditTool } from '../hooks/useAuditTool';
import type { AuditFile } from '../lib/audit-types';

export default function AuditTool({ apiBaseUrl }: { apiBaseUrl?: string }) {
  const { step, error, result, start, reset } = useAuditTool({ apiBaseUrl });

  const onFilesSelected = (files: AuditFile[]) => {
    start(files);
  };

  return (
    <section className="w-full">
      <AuditHero />
      {step === 'upload' && (
        <AuditUploader onFilesSelected={onFilesSelected} maxTotalBytes={AUDIT_DEFAULT_MAX_TOTAL_BYTES} />
      )}
      {step === 'processing' && <AuditLoading />}
      {step === 'error' && <AuditError error={error ?? 'Unknown error'} onReset={reset} />}
      {step === 'results' && result && <AuditResults result={result} onReset={reset} />}
    </section>
  );
}

