'use client';

import { useCallback, useRef, useState } from 'react';
import type { AuditFile } from '../lib/audit-types';
import { formatBytes, isAcceptedAuditFileName } from '../lib/audit-utils';

function toAuditFiles(fileList: FileList | null): AuditFile[] {
  if (!fileList) return [];
  return Array.from(fileList).map((file) => ({
    file,
    name: file.name,
    type: file.type,
    size: file.size,
  }));
}

export default function AuditUploader({
  onFilesSelected,
  disabled,
  maxTotalBytes,
}: {
  onFilesSelected: (files: AuditFile[]) => void;
  disabled?: boolean;
  maxTotalBytes?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (files: AuditFile[]): AuditFile[] => {
      setError(null);
      const filtered = files.filter((f) => isAcceptedAuditFileName(f.name));
      if (filtered.length !== files.length) {
        setError('Some files were skipped (only CSV/XLSX supported).');
      }
      const total = filtered.reduce((s, f) => s + f.size, 0);
      if (maxTotalBytes != null && total > maxTotalBytes) {
        setError(`Total upload size too large (${formatBytes(total)}).`);
        return [];
      }
      return filtered;
    },
    [maxTotalBytes]
  );

  const onPick = useCallback(() => inputRef.current?.click(), []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = validate(toAuditFiles(e.target.files));
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected, validate]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      const files = validate(toAuditFiles(e.dataTransfer.files));
      if (files.length > 0) onFilesSelected(files);
    },
    [disabled, onFilesSelected, validate]
  );

  return (
    <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-white p-8">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-4 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
          ⬆️
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Drag & drop your files</div>
          <div className="mt-1 text-sm text-gray-500">or choose files from your computer</div>
        </div>
        <button
          type="button"
          onClick={onPick}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Choose files
        </button>
        <div className="text-xs text-gray-500">Supported: CSV, XLSX</div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}

