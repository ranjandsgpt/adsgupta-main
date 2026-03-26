import { AUDIT_ACCEPTED_EXTENSIONS } from './audit-constants';

export function getFileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

export function isAcceptedAuditFileName(name: string): boolean {
  const ext = getFileExtension(name);
  return (AUDIT_ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function safeNumber(x: unknown): number {
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  const n = typeof x === 'string' ? Number(x) : Number.NaN;
  return Number.isFinite(n) ? n : 0;
}

