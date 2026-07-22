/**
 * Numeric sanitizer for Amazon CSV fields.
 *
 * Strips currency symbols (€, £, $, ₹, ¥), percent signs (%), and grouping
 * separators so values like "£141,589.10", "€3,101.82", or "1.234,56" parse.
 */
export function sanitizeNumeric(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (value === null || value === undefined || value === '') return 0;
  let str = String(value).trim();
  if (!str || str === '--' || str === '-') return 0;

  str = str.replace(/[€£$₹¥%]/g, '').trim();

  // European decimal comma: 1.234,56 or 1234,56
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(str) || /^\d+,\d{1,2}$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // US / Amazon mixed: 3,101.82 or 1,748
    str = str.replace(/,/g, '');
  }

  str = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return Number.isNaN(num) ? 0 : num;
}
