/**
 * Section 13: Date normalization engine.
 * All dates → YYYY-MM-DD for trend charts, daily spend, campaign pacing.
 */

const MONTH_ABBREV: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function pad2(n: number | string): string {
  return String(n).padStart(2, '0');
}

/** Excel serial date (days since 1899-12-30) → YYYY-MM-DD */
function fromExcelSerial(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000;
  const d = new Date(utc);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/**
 * Normalize date string to YYYY-MM-DD.
 * Handles: 2026-02-23, 02/23/2026, 23/02/2026, 23-02-2026, Jan 01, 2026, Excel serials.
 *
 * Ambiguous numeric dates (both parts ≤ 12): use preferEu when true (EU marketplaces),
 * otherwise US MM/DD/YYYY.
 */
export function normalizeDate(dateString: unknown, preferEu = false): string {
  if (dateString == null || dateString === '') return '';
  const str = String(dateString).trim();
  if (!str) return '';

  // Excel serial day number (common when sheet_to_json lacks date formatting)
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    return fromExcelSerial(Number(str));
  }

  // Already YYYY-MM-DD
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  let m = str.match(iso);
  if (m) {
    return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
  }

  // Numeric with / or -: disambiguate US vs EU when one side > 12
  const slash = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  m = str.match(slash);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const y = m[3];
    let day: number;
    let month: number;
    if (a > 12 && b <= 12) {
      // Clearly DD/MM/YYYY
      day = a;
      month = b;
    } else if (b > 12 && a <= 12) {
      // Clearly MM/DD/YYYY
      month = a;
      day = b;
    } else if (preferEu) {
      day = a;
      month = b;
    } else {
      // Default US when ambiguous (legacy behavior)
      month = a;
      day = b;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return str;
    return `${y}-${pad2(month)}-${pad2(day)}`;
  }

  // Month name: Feb 23 2026, 23 Feb 2026, January 01, 2026
  const withMonth = str.match(
    /(\d{1,2})\s+([a-zA-Z]{3,9})\s+(\d{4})|([a-zA-Z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/
  );
  if (withMonth) {
    let day: string;
    let monthStr: string;
    let year: string;
    if (withMonth[1]) {
      day = pad2(withMonth[1]);
      monthStr = withMonth[2];
      year = withMonth[3];
    } else {
      monthStr = withMonth[4];
      day = pad2(withMonth[5]);
      year = withMonth[6];
    }
    const monthNum = MONTH_ABBREV[monthStr.toLowerCase().slice(0, 3)];
    if (monthNum) {
      return `${year}-${pad2(monthNum)}-${day}`;
    }
  }

  return str;
}
