export const AUDIT_ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const;

export const AUDIT_DEFAULT_MAX_FILES = 8;
export const AUDIT_DEFAULT_MAX_TOTAL_BYTES = 60 * 1024 * 1024; // 60MB

export const AUDIT_DEFAULT_ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

