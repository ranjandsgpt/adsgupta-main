/**
 * Headless fixture runner for Amazon Audit parse → aggregate path.
 * Usage: node packages/amazon-audit/scripts/run-fixture-audit.mjs [runs=5]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const Papa = require('papaparse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.resolve(__dirname, '../.fixtures/amazon-reports');
const RUNS = Math.max(1, Number(process.argv[2] || 5));

// ── Inline copies of critical helpers (mirrors package source; keep in sync) ──

function normalizeHeader(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/[\u2013\u2014\u2212]/g, '-') // en/em/minus → hyphen
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .trim();
}

function sanitizeNumeric(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (value === null || value === undefined || value === '') return 0;
  let str = String(value).trim();
  str = str.replace(/[€£$₹¥%]/g, '');
  // EU decimal: 1.234,56 → 1234.56
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(str) || /^\d+,\d{1,2}$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    str = str.replace(/,/g, '');
  }
  str = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return Number.isNaN(num) ? 0 : num;
}

const MONTH_ABBREV = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function normalizeDate(dateString, preferEu = false) {
  if (dateString == null || dateString === '') return '';
  const str = String(dateString).trim();
  if (!str) return '';

  // Excel serial day number
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const serial = Math.floor(Number(str));
    const utc = Date.UTC(1899, 11, 30) + serial * 86400000;
    const d = new Date(utc);
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  }

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  let m = str.match(iso);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  const slash = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  m = str.match(slash);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const y = m[3];
    let day;
    let month;
    if (a > 12 && b <= 12) {
      day = a;
      month = b;
    } else if (b > 12 && a <= 12) {
      month = a;
      day = b;
    } else if (preferEu) {
      day = a;
      month = b;
    } else {
      month = a;
      day = b;
    }
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const withMonth = str.match(
    /(\d{1,2})\s+([a-zA-Z]{3,9})\s+(\d{4})|([a-zA-Z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/
  );
  if (withMonth) {
    let day;
    let monthStr;
    let year;
    if (withMonth[1]) {
      day = withMonth[1].padStart(2, '0');
      monthStr = withMonth[2];
      year = withMonth[3];
    } else {
      monthStr = withMonth[4];
      day = withMonth[5].padStart(2, '0');
      year = withMonth[6];
    }
    const monthNum = MONTH_ABBREV[monthStr.toLowerCase().slice(0, 3)];
    if (monthNum) return `${year}-${String(monthNum).padStart(2, '0')}-${day}`;
  }
  return str;
}

const COLUMN_VARIATIONS = {
  spend: ['Spend', 'Total Cost', 'Total cost', 'Cost', 'Ad Spend', 'Advertising Cost'],
  sales: ['Sales', 'Attributed Sales', 'Ad Sales', 'Ordered Product Sales', 'Total Sales'],
  sales7d: ['7 Day Total Sales', '7 Day Sales'],
  clicks: ['Clicks', 'Click Throughs', 'Ad Clicks'],
  impressions: ['Impressions', 'Ad Impressions'],
  orders: ['Orders', '7 Day Total Orders (#)', 'Total Order Items', 'Purchases'],
  searchTerm: ['Search Term', 'Customer Search Term', 'Keyword Text'],
  targetingExpr: ['Targeting'],
  campaignName: ['Campaign Name', 'Campaign name', 'Campaign'],
  adGroup: ['Ad Group', 'Ad Group Name'],
  matchType: ['Match Type'],
  asin: ['ASIN', 'Advertised ASIN', 'Child ASIN', '(Child) ASIN'],
  sku: ['SKU', 'Advertised SKU'],
  sessions: ['Sessions', 'Sessions - Total', 'Sessions – Total', 'Total Sessions'],
  orderedProductSales: ['Ordered Product Sales'],
  date: ['Date', 'Start Date', 'End Date', 'Campaign start date', 'Campaign end date', 'Recorded Date'],
};

const SEARCH_TERM_PRIORITY = ['customersearchterm', 'keywordtext', 'searchterm'];

function mapHeaders(rawHeaders) {
  const normMap = new Map();
  for (const [canonical, variants] of Object.entries(COLUMN_VARIATIONS)) {
    for (const v of variants) {
      const n = normalizeHeader(v);
      if (n && !normMap.has(n)) normMap.set(n, canonical);
    }
  }
  const map = {};
  const candidates = {};
  for (const raw of rawHeaders) {
    const key = normalizeHeader(raw);
    const canonical = normMap.get(key);
    if (!canonical) continue;
    if (!candidates[canonical]) candidates[canonical] = [];
    candidates[canonical].push(raw);
  }
  for (const [canonical, raws] of Object.entries(candidates)) {
    if (canonical === 'searchTerm' && raws.length > 1) {
      raws.sort((a, b) => {
        const na = normalizeHeader(a);
        const nb = normalizeHeader(b);
        const pa = SEARCH_TERM_PRIORITY.findIndex((p) => na.includes(p));
        const pb = SEARCH_TERM_PRIORITY.findIndex((p) => nb.includes(p));
        return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      });
    }
    // Prefer exact "Campaign Name" over longer "Campaign budget…"
    if (canonical === 'campaignName' && raws.length > 1) {
      raws.sort((a, b) => normalizeHeader(a).length - normalizeHeader(b).length);
    }
    map[canonical] = raws[0];
  }
  return map;
}

function classifyReportType(map) {
  const hasAd = !!map.spend || !!map.clicks || !!map.impressions;
  if (hasAd) return 'advertising';
  if (map.orderedProductSales || map.sales || map.sessions) return 'business';
  return 'unknown';
}

function classifySubtype(map) {
  const st = map.searchTerm ? normalizeHeader(map.searchTerm) : '';
  if (st.includes('customersearchterm') || st.includes('keywordtext') || st === 'searchterm') {
    return 'search_term';
  }
  if (map.sku || map.asin) return 'advertised_product';
  if (map.matchType) return 'targeting';
  if (map.campaignName) return 'campaign';
  if (map.targetingExpr) return 'targeting';
  return 'unknown';
}

function loadFile(filePath) {
  const name = path.basename(filePath);
  let csv;
  if (/\.xlsx?$/i.test(name)) {
    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    csv = XLSX.utils.sheet_to_csv(sheet);
  } else {
    csv = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  }
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const headers = parsed.meta.fields || [];
  const headerMap = mapHeaders(headers);
  const type = classifyReportType(headerMap);
  const subtype = type === 'advertising' ? classifySubtype(headerMap) : undefined;
  return { name, headers, headerMap, type, subtype, rows: parsed.data, csv };
}

function sumExact(rows, col, currency = false) {
  let total = 0;
  let missing = 0;
  for (const r of rows) {
    if (!(col in r)) {
      missing++;
      continue;
    }
    total += sanitizeNumeric(r[col]);
  }
  return { total, missing, n: rows.length };
}

function runOnce() {
  const files = fs.readdirSync(FIX).filter((f) => /\.(csv|xlsx)$/i.test(f));
  const loaded = files.map((f) => loadFile(path.join(FIX, f)));
  const failures = [];
  const info = [];

  for (const L of loaded) {
    info.push({
      name: L.name,
      type: L.type,
      subtype: L.subtype,
      rows: L.rows.length,
      campaignName: L.headerMap.campaignName,
      searchTerm: L.headerMap.searchTerm,
      spend: L.headerMap.spend,
      date: L.headerMap.date,
    });
    if (L.type === 'unknown') failures.push(`${L.name}: classified unknown`);
  }

  const adv = loaded.find((l) => l.subtype === 'advertised_product');
  const tgt = loaded.find((l) => l.subtype === 'targeting');
  const st = loaded.find((l) => l.subtype === 'search_term');
  const camp = loaded.find((l) => l.subtype === 'campaign');
  const biz = loaded.find((l) => l.type === 'business');

  if (!adv) failures.push('Missing advertised_product classification');
  if (!tgt) failures.push('Missing targeting classification');
  if (!st) failures.push('Missing search_term classification');
  if (!camp) failures.push('Missing campaign classification (Campaign CSV misclassified?)');
  if (!biz) failures.push('Missing business classification');

  // Search term must map to Customer Search Term, not Targeting
  if (st && st.headerMap.searchTerm && !/customer\s*search\s*term/i.test(st.headerMap.searchTerm)) {
    failures.push(`search_term mapped to "${st.headerMap.searchTerm}" instead of Customer Search Term`);
  }

  // Date samples
  if (adv?.headerMap.date) {
    const sample = adv.rows[0]?.[adv.headerMap.date];
    const norm = normalizeDate(sample);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(norm)) failures.push(`ADV date normalize failed: ${sample} → ${norm}`);
    info.push({ advDateSample: sample, normalized: norm });
  }
  if (camp?.rows[0]) {
    const raw = camp.rows[0]['Campaign start date'];
    const norm = normalizeDate(raw, true);
    if (norm !== '2025-08-29' && raw === '29/08/2025') {
      failures.push(`EU date failed: ${raw} → ${norm}`);
    }
    info.push({ campDateSample: raw, normalized: norm });
  }

  const adSpend = adv ? sumExact(adv.rows, 'Spend').total : 0;
  const adSales = adv ? sumExact(adv.rows, '7 Day Total Sales').total : 0;
  const storeSales = biz ? sumExact(biz.rows, 'Ordered Product Sales').total : 0;
  const sessions = biz ? sumExact(biz.rows, 'Sessions – Total').total : 0;
  const campSpend = camp ? sumExact(camp.rows, camp.headerMap.spend || 'Total cost').total : 0;

  if (adSpend <= 0) failures.push('adSpend is 0');
  if (adSales <= 0) failures.push('adSales is 0');
  if (storeSales <= 0) failures.push('storeSales is 0');
  if (sessions <= 0) failures.push('sessions is 0');
  if (camp && Math.abs(adSpend - campSpend) > 0.05) {
    failures.push(`Spend mismatch ADV ${adSpend} vs Campaign ${campSpend}`);
  }
  if (adSales > storeSales) failures.push(`INVARIANT: adSales ${adSales} > storeSales ${storeSales}`);

  const currency = adv?.rows[0]?.Currency || 'EUR';
  const metrics = {
    adSpend: round2(adSpend),
    adSales: round2(adSales),
    storeSales: round2(storeSales),
    sessions,
    acos: adSales ? adSpend / adSales : null,
    tacos: storeSales ? adSpend / storeSales : null,
    roas: adSpend ? adSales / adSpend : null,
    currency,
    rowCounts: {
      adv: adv?.rows.length ?? 0,
      tgt: tgt?.rows.length ?? 0,
      st: st?.rows.length ?? 0,
      camp: camp?.rows.length ?? 0,
      biz: biz?.rows.length ?? 0,
    },
  };

  return { failures, info, metrics };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

const results = [];
for (let i = 1; i <= RUNS; i++) {
  const r = runOnce();
  results.push(r);
  console.log(`\n=== RUN ${i}/${RUNS} ===`);
  if (i === 1) console.log('classification:', JSON.stringify(r.info.filter((x) => x.name), null, 2));
  console.log('metrics:', r.metrics);
  if (r.failures.length) {
    console.log('FAILURES:', r.failures);
  } else {
    console.log('OK');
  }
}

const first = JSON.stringify(results[0].metrics);
const stable = results.every((r) => JSON.stringify(r.metrics) === first && r.failures.length === 0);
console.log(`\n======== SUMMARY ========`);
console.log(`runs=${RUNS} stable=${stable} failures=${results.reduce((s, r) => s + r.failures.length, 0)}`);
if (!stable) process.exit(1);
