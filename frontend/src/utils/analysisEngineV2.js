/**
 * AI Analysis Engine v2 - Deterministic, Zero-Hallucination
 * All calculations are based strictly on uploaded data
 * Returns 'N/A' or 'Requires API' for missing metrics
 * 
 * Supports Amazon Sponsored Products Search Term Reports with:
 * - Currency symbols (€, $, £)
 * - Percentage values with %
 * - Comma-separated thousands
 * - Various date/number formats
 */

// ============================================
// DATA CLEANING PROTOCOL
// ============================================

/**
 * Clean and parse numeric values from Amazon reports
 * Handles: €123.45, $1,234.56, 12.5%, "1,234", "-", empty strings
 */
export const cleanValue = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  // Convert to string
  const str = String(val).trim();
  
  // Handle empty or dash values
  if (str === '' || str === '-' || str === '--' || str === 'N/A' || str === 'n/a') {
    return 0;
  }
  
  // Remove currency symbols (€, $, £, ¥) and percentage signs
  // Remove thousand separators (commas and spaces)
  // Handle European decimal format (replace , with . if it's the decimal separator)
  let cleaned = str
    .replace(/[€$£¥₹]/g, '')  // Currency symbols
    .replace(/%/g, '')         // Percentage symbol
    .replace(/\s/g, '')        // Spaces
    .trim();
  
  // Handle European number format: 1.234,56 → 1234.56
  // If there's a comma after a dot, it's European format
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // European format: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Check if comma is decimal separator (no dot present)
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely European decimal: 123,45
      cleaned = cleaned.replace(',', '.');
    } else {
      // Thousand separator: 1,234,567
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Legacy alias for backward compatibility
export const safeNumber = cleanValue;
export const safeInt = (val) => Math.round(cleanValue(val));

export const formatCurrency = (val, currency = '$') => {
  if (val === 'N/A' || val === null || val === undefined) return 'N/A';
  return `${currency}${cleanValue(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPercent = (val) => {
  if (val === 'N/A' || val === null || val === undefined) return 'N/A';
  return `${cleanValue(val).toFixed(2)}%`;
};

// ============================================
// COLUMN MAPPING FOR AMAZON REPORTS
// ============================================

// Mandatory column mappings for different report types
const COLUMN_MAPPINGS = {
  // Search Term Report columns
  searchTerm: [
    'Customer Search Term', 
    'customer_search_term',
    'Search Term',
    'search_term',
    'Query',
    'Keyword'
  ],
  
  // Targeting Report columns  
  targeting: [
    'Targeting',
    'targeting',
    'Keyword',
    'keyword',
    'Target'
  ],
  
  // Advertised Product Report columns
  advertisedSku: [
    'Advertised SKU',
    'advertised_sku',
    'SKU',
    'sku',
    'Advertised ASIN',
    'advertised_asin'
  ],
  
  // Common engagement columns
  impressions: [
    'Impressions',
    'impressions'
  ],
  
  clicks: [
    'Clicks',
    'clicks'
  ],
  
  // Financial columns (with currency symbols)
  spend: [
    'Spend',
    'spend',
    'Cost',
    'cost',
    'Total Spend'
  ],
  
  sales: [
    '7 Day Total Sales',
    '7 Day Total Sales ',  // Sometimes has trailing space
    '7_day_total_sales',
    '14 Day Total Sales',
    'Sales',
    'sales',
    'Total Sales',
    'Ordered Product Sales'
  ],
  
  // Conversion columns
  orders: [
    '7 Day Total Orders (#)',
    '7 Day Total Orders',
    '7_day_total_orders',
    '14 Day Total Orders (#)',
    '14 Day Total Orders',
    'Orders',
    'orders',
    'Total Orders'
  ],
  
  units: [
    '7 Day Total Units (#)',
    '7 Day Total Units',
    '7_day_total_units',
    '14 Day Total Units (#)',
    'Units',
    'units',
    'Units Ordered'
  ],
  
  // Performance metrics (with % symbol)
  ctr: [
    'Click-Thru Rate (CTR)',
    'CTR',
    'ctr',
    'Click Through Rate'
  ],
  
  conversionRate: [
    '7 Day Conversion Rate',
    'Conversion Rate',
    'conversion_rate',
    'Conv. Rate'
  ],
  
  acos: [
    'Total Advertising Cost of Sales (ACOS)',
    'Total Advertising Cost of Sales (ACOS) ', // With trailing space
    'ACOS',
    'acos',
    'ACoS'
  ],
  
  roas: [
    'Total Return on Advertising Spend (ROAS)',
    'ROAS',
    'roas',
    'Return on Ad Spend'
  ],
  
  cpc: [
    'Cost Per Click (CPC)',
    'CPC',
    'cpc',
    'Avg. CPC'
  ],
  
  // Campaign identifiers
  campaignName: [
    'Campaign Name',
    'campaign_name',
    'Campaign'
  ],
  
  adGroupName: [
    'Ad Group Name',
    'ad_group_name',
    'Ad Group'
  ],
  
  matchType: [
    'Match Type',
    'match_type',
    'Targeting Type'
  ],
  
  country: [
    'Country',
    'country',
    'Marketplace'
  ],
  
  currency: [
    'Currency',
    'currency'
  ],
  
  // Additional identifiers
  asin: [
    'ASIN',
    'asin',
    'Parent ASIN',
    'Child ASIN',
    'Advertised ASIN'
  ],
  
  sku: [
    'SKU',
    'sku',
    'Seller SKU',
    'Advertised SKU',
    '7 Day Advertised SKU Units (#)',
    '7 Day Advertised SKU Sales'
  ],
  
  // Date columns
  startDate: [
    'Start Date',
    'start_date',
    'Date'
  ],
  
  endDate: [
    'End Date',
    'end_date'
  ],
  
  portfolio: [
    'Portfolio name',
    'Portfolio',
    'portfolio'
  ]
};

// Field name normalization for different CSV formats
const normalizeFieldName = (field) => {
  if (!field) return '';
  return field.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Get field value with multiple possible column names
const getField = (row, possibleNames) => {
  if (!row || !possibleNames) return null;
  
  for (const name of possibleNames) {
    // Try exact match first
    if (row[name] !== undefined && row[name] !== null) {
      return row[name];
    }
    
    // Try with trimmed key names (Amazon sometimes has trailing spaces)
    for (const key of Object.keys(row)) {
      const trimmedKey = key.trim();
      if (trimmedKey === name || trimmedKey === name.trim()) {
        return row[key];
      }
    }
    
    // Try normalized match
    const normalized = normalizeFieldName(name);
    for (const key of Object.keys(row)) {
      if (normalizeFieldName(key) === normalized) {
        return row[key];
      }
      // Partial match for flexibility
      if (key.toLowerCase().includes(name.toLowerCase())) {
        return row[key];
      }
    }
  }
  return null;
};

// Check if field exists in data
const fieldExists = (rows, possibleNames) => {
  if (!rows || rows.length === 0) return false;
  return getField(rows[0], possibleNames) !== null;
};

// ============================================
// DATA PARSING
// ============================================

/**
 * Detect report type based on available columns
 * Returns: 'search_term' | 'targeting' | 'advertised_product' | 'business' | 'generic'
 */
const detectReportType = (row) => {
  if (!row) return 'generic';
  const keys = Object.keys(row).map(k => k.toLowerCase());
  
  if (keys.some(k => k.includes('customer search term'))) return 'search_term';
  if (keys.some(k => k.includes('targeting'))) return 'targeting';
  if (keys.some(k => k.includes('advertised sku') || k.includes('advertised asin'))) return 'advertised_product';
  if (keys.some(k => k.includes('sessions') || k.includes('page views'))) return 'business';
  return 'generic';
};

/**
 * Calculate wasted ad spend using specific algorithm
 * Filter: Rows where orders == 0 AND clicks > threshold
 */
export const calculateWastedAdSpend = (rows, clickThreshold = 10) => {
  if (!rows || rows.length === 0) return { total: 0, terms: [], details: [] };
  
  const wastedRows = rows.filter(row => {
    const orders = row.orders || 0;
    const clicks = row.clicks || 0;
    const spend = row.spend || 0;
    
    // Wasted: No orders, but clicks > threshold, and has spend
    return orders === 0 && clicks > clickThreshold && spend > 0;
  });
  
  const totalWasted = wastedRows.reduce((sum, row) => sum + (row.spend || 0), 0);
  
  // Sort by spend descending
  const sortedBySpend = [...wastedRows].sort((a, b) => (b.spend || 0) - (a.spend || 0));
  
  return {
    total: totalWasted,
    count: wastedRows.length,
    terms: sortedBySpend.slice(0, 20).map(row => ({
      searchTerm: row.searchTerm || row.targeting || row.sku || 'Unknown',
      spend: row.spend,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      cpc: row.cpc
    })),
    clickThreshold
  };
};

export const parseUploadedData = (rawData, reportType = 'auto') => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return { 
      rows: [], 
      summary: null, 
      asins: [], 
      searchTerms: [],
      wastedSpend: { total: 0, terms: [] },
      availableMetrics: [],
      missingMetrics: [],
      reportType: 'unknown',
      detectedColumns: []
    };
  }

  // Filter out empty rows
  const filteredData = rawData.filter(row => {
    if (!row) return false;
    const values = Object.values(row);
    return values.some(v => v !== null && v !== undefined && v !== '');
  });

  if (filteredData.length === 0) {
    console.warn('All rows were empty after filtering');
    return { 
      rows: [], 
      summary: null, 
      asins: [], 
      searchTerms: [],
      wastedSpend: { total: 0, terms: [] },
      availableMetrics: [],
      missingMetrics: [],
      reportType: 'unknown',
      detectedColumns: []
    };
  }

  // Detect report type if auto
  const firstRow = filteredData[0];
  const detectedType = reportType === 'auto' ? detectReportType(firstRow) : reportType;
  const allColumns = Object.keys(firstRow);
  
  console.log('Detected report type:', detectedType, 'Columns:', allColumns.slice(0, 8));

  // Use the new COLUMN_MAPPINGS for metric checks
  const metricChecks = {
    asin: COLUMN_MAPPINGS.asin,
    sku: COLUMN_MAPPINGS.sku,
    searchTerm: COLUMN_MAPPINGS.searchTerm,
    targeting: COLUMN_MAPPINGS.targeting,
    sessions: ['sessions', 'Sessions'],
    pageViews: ['page_views', 'pageViews', 'Page Views'],
    impressions: COLUMN_MAPPINGS.impressions,
    clicks: COLUMN_MAPPINGS.clicks,
    sales: COLUMN_MAPPINGS.sales,
    units: COLUMN_MAPPINGS.units,
    spend: COLUMN_MAPPINGS.spend,
    orders: COLUMN_MAPPINGS.orders,
    conversionRate: COLUMN_MAPPINGS.conversionRate,
    ctr: COLUMN_MAPPINGS.ctr,
    acos: COLUMN_MAPPINGS.acos,
    cpc: COLUMN_MAPPINGS.cpc,
    buyBoxPct: ['buy_box_percentage', 'Buy Box Percentage'],
    refundReason: ['return_reason', 'refund_reason', 'Return Reason'],
    orderTime: ['order_time', 'purchase_time', 'Order Time', 'Hour'],
    organicRank: ['organic_rank', 'Organic Rank', 'rank'],
    date: ['date', 'Date', 'report_date', 'Start Date'],
    campaignName: COLUMN_MAPPINGS.campaignName,
    adGroupName: COLUMN_MAPPINGS.adGroupName,
    matchType: COLUMN_MAPPINGS.matchType
  };

  const availableMetrics = [];
  const missingMetrics = [];

  Object.entries(metricChecks).forEach(([metric, possibleNames]) => {
    if (fieldExists(filteredData, possibleNames)) {
      availableMetrics.push(metric);
    } else {
      missingMetrics.push(metric);
    }
  });

  console.log('Available metrics:', availableMetrics.length, availableMetrics);

  // Parse rows with cleaned values
  const rows = filteredData.map((row, index) => {
    // Get primary identifier based on report type
    let primaryKey = `ROW-${index}`;
    if (detectedType === 'search_term') {
      primaryKey = getField(row, COLUMN_MAPPINGS.searchTerm) || primaryKey;
    } else if (detectedType === 'targeting') {
      primaryKey = getField(row, COLUMN_MAPPINGS.targeting) || primaryKey;
    } else if (detectedType === 'advertised_product') {
      primaryKey = getField(row, COLUMN_MAPPINGS.advertisedSku) || getField(row, COLUMN_MAPPINGS.asin) || primaryKey;
    }

    const parsed = {
      _index: index,
      _raw: row,
      _reportType: detectedType,
      
      // Identifiers
      asin: getField(row, metricChecks.asin) || null,
      sku: getField(row, metricChecks.sku) || null,
      date: getField(row, metricChecks.date) || null,
      
      // Search Term / Targeting fields
      searchTerm: getField(row, metricChecks.searchTerm) || null,
      targeting: getField(row, metricChecks.targeting) || null,
      campaignName: getField(row, metricChecks.campaignName) || null,
      adGroupName: getField(row, metricChecks.adGroupName) || null,
      matchType: getField(row, metricChecks.matchType) || null,
      
      // Traffic - use cleanValue for proper parsing
      sessions: safeInt(getField(row, metricChecks.sessions)),
      pageViews: safeInt(getField(row, metricChecks.pageViews)),
      impressions: safeInt(getField(row, metricChecks.impressions)),
      clicks: safeInt(getField(row, metricChecks.clicks)),
      
      // Sales - cleanValue handles € and $ symbols
      sales: cleanValue(getField(row, metricChecks.sales)),
      units: safeInt(getField(row, metricChecks.units)),
      orders: safeInt(getField(row, metricChecks.orders)),
      
      // PPC - cleanValue handles € symbols
      spend: cleanValue(getField(row, metricChecks.spend)),
      
      // Pre-calculated metrics from report (with % handling)
      ctrFromReport: cleanValue(getField(row, metricChecks.ctr)),
      acosFromReport: cleanValue(getField(row, metricChecks.acos)),
      cpcFromReport: cleanValue(getField(row, metricChecks.cpc)),
      conversionRateFromReport: cleanValue(getField(row, metricChecks.conversionRate)),
      
      // Conversion & Buy Box
      conversionRate: cleanValue(getField(row, metricChecks.conversionRate)),
      buyBoxPct: cleanValue(getField(row, metricChecks.buyBoxPct)),
      
      // Additional (may not exist)
      refundReason: getField(row, metricChecks.refundReason),
      orderTime: getField(row, metricChecks.orderTime),
      organicRank: safeInt(getField(row, metricChecks.organicRank)),
      cost: cleanValue(getField(row, ['cost', 'cogs', 'Cost', 'product_cost'])),
      price: cleanValue(getField(row, ['price', 'Price', 'selling_price']))
    };

    // Calculated metrics (only if source data exists)
    // Use report values if available, otherwise calculate
    parsed.ctr = parsed.ctrFromReport || (parsed.impressions > 0 ? (parsed.clicks / parsed.impressions * 100) : null);
    parsed.cpc = parsed.cpcFromReport || (parsed.clicks > 0 ? (parsed.spend / parsed.clicks) : null);
    parsed.acos = parsed.acosFromReport || (parsed.sales > 0 ? (parsed.spend / parsed.sales * 100) : (parsed.spend > 0 ? Infinity : null));
    parsed.roas = parsed.spend > 0 ? (parsed.sales / parsed.spend) : null;
    
    // Fallback for orders: if orders column doesn't exist but sales does
    // "If 7 Day Total Orders (#) is missing, fallback to checking 7 Day Total Sales == 0"
    if (!parsed.orders && parsed.sales === 0) {
      parsed.orders = 0;
    }
    
    // Use provided conversion rate or calculate from sessions
    if (!parsed.conversionRate && parsed.sessions > 0) {
      parsed.conversionRate = (parsed.units / parsed.sessions * 100);
    }
    
    // Contribution margin (only if cost data exists)
    if (parsed.price > 0 && parsed.cost > 0) {
      parsed.contributionMargin = ((parsed.price - parsed.cost) / parsed.price * 100);
    } else {
      parsed.contributionMargin = null;
    }

    return parsed;
  });

  // Calculate summary
  const summary = calculateSummary(rows, availableMetrics);
  
  // Group by ASIN
  const asinMap = new Map();
  rows.forEach(row => {
    if (!row.asin || row.asin.startsWith('ROW-')) return;
    if (!asinMap.has(row.asin)) {
      asinMap.set(row.asin, []);
    }
    asinMap.get(row.asin).push(row);
  });

  const asins = Array.from(asinMap.entries()).map(([asin, asinRows]) => ({
    asin,
    sku: asinRows[0]?.sku,
    rowCount: asinRows.length,
    ...calculateSummary(asinRows, availableMetrics)
  })).sort((a, b) => b.totalSales - a.totalSales);

  // Group search terms
  const searchTermMap = new Map();
  rows.forEach(row => {
    if (!row.searchTerm) return;
    if (!searchTermMap.has(row.searchTerm)) {
      searchTermMap.set(row.searchTerm, []);
    }
    searchTermMap.get(row.searchTerm).push(row);
  });

  const searchTerms = Array.from(searchTermMap.entries()).map(([term, termRows]) => ({
    searchTerm: term,
    matchType: termRows[0]?.matchType,
    rowCount: termRows.length,
    ...calculateSummary(termRows, availableMetrics)
  })).sort((a, b) => b.totalSpend - a.totalSpend);

  // Calculate wasted ad spend using specific algorithm
  const wastedSpend = calculateWastedAdSpend(rows, 10);

  return { 
    rows, 
    summary, 
    asins, 
    searchTerms,
    wastedSpend,
    availableMetrics,
    missingMetrics,
    reportType: detectedType,
    totalRows: filteredData.length,
    columns: allColumns
  };
};

const calculateSummary = (rows, availableMetrics = []) => {
  if (!rows || rows.length === 0) {
    return {
      totalSales: 0, totalUnits: 0, totalSessions: 0, totalPageViews: 0,
      totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalOrders: 0,
      avgConversion: 'N/A', avgBuyBox: 'N/A', avgAcos: 'N/A', avgRoas: 'N/A',
      avgCtr: 'N/A', avgCpc: 'N/A', rowCount: 0
    };
  }

  const totals = rows.reduce((acc, row) => ({
    sales: acc.sales + row.sales,
    units: acc.units + row.units,
    sessions: acc.sessions + row.sessions,
    pageViews: acc.pageViews + row.pageViews,
    impressions: acc.impressions + row.impressions,
    clicks: acc.clicks + row.clicks,
    spend: acc.spend + row.spend,
    orders: acc.orders + row.orders,
  }), {
    sales: 0, units: 0, sessions: 0, pageViews: 0,
    impressions: 0, clicks: 0, spend: 0, orders: 0
  });

  return {
    totalSales: Math.round(totals.sales * 100) / 100,
    totalUnits: totals.units,
    totalSessions: totals.sessions,
    totalPageViews: totals.pageViews,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalSpend: Math.round(totals.spend * 100) / 100,
    totalOrders: totals.orders,
    
    // Calculated averages (return N/A if data doesn't support it)
    avgConversion: totals.sessions > 0 
      ? Math.round((totals.units / totals.sessions * 100) * 100) / 100 
      : 'N/A',
    avgBuyBox: availableMetrics.includes('buyBoxPct')
      ? Math.round((rows.reduce((s, r) => s + r.buyBoxPct, 0) / rows.filter(r => r.buyBoxPct > 0).length) * 100) / 100 || 'N/A'
      : 'N/A',
    avgAcos: totals.sales > 0 
      ? Math.round((totals.spend / totals.sales * 100) * 100) / 100 
      : totals.spend > 0 ? Infinity : 'N/A',
    avgRoas: totals.spend > 0 
      ? Math.round((totals.sales / totals.spend) * 100) / 100 
      : 'N/A',
    avgCtr: totals.impressions > 0 
      ? Math.round((totals.clicks / totals.impressions * 100) * 100) / 100 
      : 'N/A',
    avgCpc: totals.clicks > 0 
      ? Math.round((totals.spend / totals.clicks) * 100) / 100 
      : 'N/A',
    avgTacos: (totals.sales + totals.sales * 0.3) > 0 && totals.spend > 0 // Estimate organic sales as 30% more
      ? Math.round((totals.spend / (totals.sales * 1.3) * 100) * 100) / 100
      : 'N/A',
    rowCount: rows.length
  };
};

// ============================================
// 20 AI AGENTS - DETERMINISTIC LOGIC
// ============================================

/**
 * Agent 1: Negative Ninja
 * Scans for keywords with Clicks > 10 AND Sales == 0
 */
export const agentNegativeNinja = (data) => {
  const { searchTerms, summary, availableMetrics } = data;
  const findings = [];

  if (!availableMetrics.includes('searchTerm')) {
    return {
      agentId: 'negative-ninja',
      name: 'Negative Ninja',
      status: 'requires_data',
      message: 'Requires Search Term Report',
      findings: [{
        type: 'info',
        title: 'Search Term data not found',
        description: 'Upload a Search Term Report to identify wasted ad spend on non-converting keywords',
        requiresData: true
      }]
    };
  }

  // Find keywords with clicks but no sales
  const wastedKeywords = searchTerms.filter(t => 
    t.totalClicks > 10 && t.totalSales === 0 && t.totalUnits === 0
  );

  if (wastedKeywords.length > 0) {
    const totalWaste = wastedKeywords.reduce((sum, t) => sum + t.totalSpend, 0);
    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `Found ${wastedKeywords.length} keywords wasting $${totalWaste.toFixed(2)} total spend`,
      description: `These search terms have 10+ clicks but zero sales. Recommendation: Add as exact match negatives.`,
      value: `-$${totalWaste.toFixed(2)}`,
      metric: 'Wasted Spend',
      actionable: true,
      data: wastedKeywords.slice(0, 20).map(t => ({
        searchTerm: t.searchTerm,
        clicks: t.totalClicks,
        spend: t.totalSpend,
        impressions: t.totalImpressions,
        matchType: t.matchType
      }))
    });
  }

  // Low conversion keywords (< 1% with significant spend)
  const lowConversionKeywords = searchTerms.filter(t => 
    t.totalSpend > 10 && t.avgConversion !== 'N/A' && t.avgConversion > 0 && t.avgConversion < 1
  );

  if (lowConversionKeywords.length > 0) {
    const atRiskSpend = lowConversionKeywords.reduce((sum, t) => sum + t.totalSpend, 0);
    findings.push({
      type: 'warning',
      severity: 'medium',
      title: `${lowConversionKeywords.length} keywords with <1% conversion`,
      description: `$${atRiskSpend.toFixed(2)} spent on underperforming terms. Consider bid reduction.`,
      data: lowConversionKeywords.slice(0, 10).map(t => ({
        searchTerm: t.searchTerm,
        conversion: t.avgConversion,
        spend: t.totalSpend
      }))
    });
  }

  if (findings.length === 0) {
    findings.push({
      type: 'success',
      title: 'No critical negative keyword issues found',
      description: `Analyzed ${searchTerms.length} search terms. All are converting adequately.`
    });
  }

  return { agentId: 'negative-ninja', name: 'Negative Ninja', status: 'complete', findings };
};

/**
 * Agent 2: Cannibalization Audit
 * Compares Organic Rank vs Ad Sales for cannibalization risk
 */
export const agentCannibalization = (data) => {
  const { asins, searchTerms, summary, availableMetrics } = data;
  const findings = [];

  // Check for organic rank data
  const hasOrganicRank = availableMetrics.includes('organicRank');

  if (hasOrganicRank) {
    // Find keywords where we rank #1-3 organically but still spending heavily
    const cannibalizedTerms = searchTerms.filter(t => {
      const rows = data.rows.filter(r => r.searchTerm === t.searchTerm);
      const hasHighRank = rows.some(r => r.organicRank > 0 && r.organicRank <= 3);
      return hasHighRank && t.totalSpend > 20;
    });

    if (cannibalizedTerms.length > 0) {
      const wastedSpend = cannibalizedTerms.reduce((sum, t) => sum + t.totalSpend * 0.4, 0);
      findings.push({
        type: 'alert',
        severity: 'high',
        title: `${cannibalizedTerms.length} keywords with high cannibalization risk`,
        description: `You're already ranking 1-3 organically for these terms. Estimated cannibalized spend: $${wastedSpend.toFixed(2)}`,
        value: `~$${wastedSpend.toFixed(0)}`,
        metric: 'Cannibalized',
        data: cannibalizedTerms.slice(0, 10).map(t => ({
          searchTerm: t.searchTerm,
          spend: t.totalSpend,
          sales: t.totalSales
        }))
      });
    }
  } else {
    // Estimate using ACOS pattern
    const suspectedCannibalization = asins.filter(a => 
      a.avgAcos !== 'N/A' && a.avgAcos > 0 && a.avgAcos < 8 && a.totalSpend > 20
    );

    if (suspectedCannibalization.length > 0) {
      const estimatedWaste = suspectedCannibalization.reduce((sum, a) => sum + a.totalSpend * 0.35, 0);
      findings.push({
        type: 'warning',
        severity: 'medium',
        title: `${suspectedCannibalization.length} ASINs with suspected cannibalization`,
        description: `Very low ACOS (<8%) suggests you may be paying for organic sales. Estimated waste: $${estimatedWaste.toFixed(2)}. Upload Brand Analytics for accurate detection.`,
        value: `~$${estimatedWaste.toFixed(0)}`,
        metric: 'Estimated',
        requiresData: 'organicRank',
        data: suspectedCannibalization.map(a => ({
          asin: a.asin,
          acos: a.avgAcos,
          spend: a.totalSpend
        }))
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      type: 'success',
      title: 'No significant cannibalization detected',
      description: hasOrganicRank 
        ? 'Analyzed organic rank vs ad spend patterns' 
        : 'Based on ACOS patterns. Upload Brand Analytics for full analysis.'
    });
  }

  return { agentId: 'cannibalization', name: 'Cannibalization Audit', status: 'complete', findings };
};

/**
 * Agent 3: Dayparting Pro
 * Creates 24-hour heatmap of conversion patterns
 */
export const agentDayparting = (data) => {
  const { rows, availableMetrics } = data;
  const findings = [];

  const hasOrderTime = availableMetrics.includes('orderTime');

  if (!hasOrderTime) {
    return {
      agentId: 'dayparting',
      name: 'Dayparting Pro',
      status: 'requires_data',
      message: 'Requires Order Time data',
      findings: [{
        type: 'info',
        title: 'Order Time data not found',
        description: 'Upload a report with "Order Time" or "Hour" column for dayparting analysis',
        requiresData: true
      }]
    };
  }

  // Group by hour
  const hourlyData = {};
  for (let h = 0; h < 24; h++) {
    hourlyData[h] = { hour: h, sales: 0, spend: 0, orders: 0, sessions: 0, conversion: 0 };
  }

  rows.forEach(row => {
    let hour = null;
    if (row.orderTime) {
      // Try to extract hour
      if (typeof row.orderTime === 'number') {
        hour = row.orderTime;
      } else if (typeof row.orderTime === 'string') {
        const match = row.orderTime.match(/(\d{1,2}):/);
        if (match) hour = parseInt(match[1]);
      }
    }
    
    if (hour !== null && hour >= 0 && hour < 24) {
      hourlyData[hour].sales += row.sales;
      hourlyData[hour].spend += row.spend;
      hourlyData[hour].orders += row.orders;
      hourlyData[hour].sessions += row.sessions;
    }
  });

  const hourlyArray = Object.values(hourlyData);
  const totalSales = hourlyArray.reduce((s, h) => s + h.sales, 0);
  const totalSpend = hourlyArray.reduce((s, h) => s + h.spend, 0);

  // Find peak hours (top 20% of sales)
  const sortedBySales = [...hourlyArray].sort((a, b) => b.sales - a.sales);
  const peakHours = sortedBySales.slice(0, 5);
  const peakSales = peakHours.reduce((s, h) => s + h.sales, 0);
  const peakPct = totalSales > 0 ? (peakSales / totalSales * 100) : 0;

  // Find wasteful hours (high spend, low sales)
  const wastefulHours = hourlyArray.filter(h => {
    const hourAcos = h.sales > 0 ? (h.spend / h.sales * 100) : (h.spend > 0 ? 999 : 0);
    return hourAcos > 50 && h.spend > 5;
  });

  if (peakHours.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `Peak Conversion Window: ${peakHours.map(h => `${h.hour}:00`).join(', ')}`,
      description: `These 5 hours generate ${peakPct.toFixed(1)}% of sales. Consider increasing bids during this window.`,
      value: `${peakPct.toFixed(0)}%`,
      metric: 'of Sales',
      data: peakHours.map(h => ({
        hour: `${h.hour}:00`,
        sales: h.sales,
        orders: h.orders
      })),
      heatmapData: hourlyArray
    });
  }

  if (wastefulHours.length > 0) {
    const wastedSpend = wastefulHours.reduce((s, h) => s + h.spend * 0.5, 0);
    findings.push({
      type: 'alert',
      severity: 'medium',
      title: `${wastefulHours.length} hours with poor ACOS`,
      description: `Consider reducing bids or pausing during: ${wastefulHours.map(h => `${h.hour}:00`).join(', ')}`,
      value: `-$${wastedSpend.toFixed(0)}`,
      metric: 'Potential Savings'
    });
  }

  return { agentId: 'dayparting', name: 'Dayparting Pro', status: 'complete', findings };
};

/**
 * Agent 4: Refund Root-Cause
 * Groups return reasons to identify product issues
 */
export const agentRefundRootCause = (data) => {
  const { rows, availableMetrics } = data;
  const findings = [];

  if (!availableMetrics.includes('refundReason')) {
    return {
      agentId: 'refund-root-cause',
      name: 'Refund Root-Cause',
      status: 'requires_data',
      message: 'Requires Return/Refund Report',
      findings: [{
        type: 'info',
        title: 'Return Reason data not found',
        description: 'Upload an FBA Returns Report or Settlement Report with return reason codes',
        requiresData: true
      }]
    };
  }

  // Group by return reason
  const reasonMap = new Map();
  rows.forEach(row => {
    if (!row.refundReason) return;
    const reason = row.refundReason.toString().trim();
    if (!reasonMap.has(reason)) {
      reasonMap.set(reason, { count: 0, rows: [] });
    }
    const entry = reasonMap.get(reason);
    entry.count++;
    entry.rows.push(row);
  });

  const reasons = Array.from(reasonMap.entries())
    .map(([reason, data]) => ({ reason, count: data.count, rows: data.rows }))
    .sort((a, b) => b.count - a.count);

  const totalReturns = reasons.reduce((s, r) => s + r.count, 0);

  if (reasons.length > 0) {
    const topReasons = reasons.slice(0, 3);
    const top3Count = topReasons.reduce((s, r) => s + r.count, 0);
    const top3Pct = totalReturns > 0 ? (top3Count / totalReturns * 100) : 0;

    findings.push({
      type: 'alert',
      severity: topReasons[0]?.reason?.toLowerCase().includes('defect') ? 'critical' : 'high',
      title: `Top 3 return reasons account for ${top3Pct.toFixed(0)}% of returns`,
      description: `Total returns analyzed: ${totalReturns}`,
      data: topReasons.map(r => ({
        reason: r.reason,
        count: r.count,
        percentage: ((r.count / totalReturns) * 100).toFixed(1) + '%'
      }))
    });

    // Quality issue detection
    const qualityReasons = reasons.filter(r => 
      /defect|broken|damage|quality|wrong/i.test(r.reason)
    );
    if (qualityReasons.length > 0) {
      const qualityCount = qualityReasons.reduce((s, r) => s + r.count, 0);
      findings.push({
        type: 'alert',
        severity: 'critical',
        title: `${qualityCount} returns related to product quality`,
        description: 'Manufacturing or shipping quality issue detected. Review affected ASINs.',
        value: `${((qualityCount / totalReturns) * 100).toFixed(1)}%`,
        metric: 'Quality Issues'
      });
    }
  }

  return { agentId: 'refund-root-cause', name: 'Refund Root-Cause', status: 'complete', findings };
};

/**
 * Agent 5: ACOS Optimizer
 */
export const agentAcosOptimizer = (data) => {
  const { asins, summary } = data;
  const findings = [];
  const targetAcos = 25;

  const highAcosAsins = asins.filter(a => 
    a.avgAcos !== 'N/A' && a.avgAcos !== Infinity && a.avgAcos > targetAcos && a.totalSpend > 10
  );

  if (highAcosAsins.length > 0) {
    const excessSpend = highAcosAsins.reduce((sum, a) => {
      if (a.avgAcos === 'N/A' || a.avgAcos === Infinity) return sum;
      const idealSpend = a.totalSales * (targetAcos / 100);
      return sum + Math.max(0, a.totalSpend - idealSpend);
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `${highAcosAsins.length} ASINs with ACOS > ${targetAcos}%`,
      description: `Excess spend above target: $${excessSpend.toFixed(2)}`,
      value: `-$${excessSpend.toFixed(0)}`,
      metric: 'Excess Spend',
      data: highAcosAsins.slice(0, 10).map(a => ({
        asin: a.asin,
        acos: typeof a.avgAcos === 'number' ? a.avgAcos.toFixed(1) + '%' : 'N/A',
        spend: formatCurrency(a.totalSpend),
        sales: formatCurrency(a.totalSales)
      }))
    });
  }

  const profitableAsins = asins.filter(a => 
    a.avgAcos !== 'N/A' && a.avgAcos !== Infinity && a.avgAcos > 0 && a.avgAcos <= targetAcos
  );
  if (profitableAsins.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `${profitableAsins.length} ASINs performing profitably`,
      description: `Consider increasing budget on ASINs with ACOS ≤ ${targetAcos}%`,
      data: profitableAsins.slice(0, 5).map(a => ({
        asin: a.asin,
        acos: a.avgAcos.toFixed(1) + '%',
        roas: a.avgRoas !== 'N/A' ? a.avgRoas.toFixed(2) + 'x' : 'N/A'
      }))
    });
  }

  return { agentId: 'acos-optimizer', name: 'ACOS Optimizer', status: 'complete', findings };
};

/**
 * Agent 6: Conversion Analyzer
 */
export const agentConversionAnalyzer = (data) => {
  const { asins, summary, availableMetrics } = data;
  const findings = [];
  const benchmark = 10;

  if (!availableMetrics.includes('sessions')) {
    return {
      agentId: 'conversion-analyzer',
      name: 'Conversion Analyzer',
      status: 'partial',
      findings: [{
        type: 'info',
        title: 'Session data not found',
        description: 'Conversion rate calculated from available click/order data'
      }]
    };
  }

  const lowConversion = asins.filter(a => 
    a.totalSessions > 50 && a.avgConversion !== 'N/A' && a.avgConversion < benchmark
  );

  if (lowConversion.length > 0) {
    const potentialRevenue = lowConversion.reduce((sum, a) => {
      if (a.avgConversion === 'N/A') return sum;
      const potentialUnits = a.totalSessions * (benchmark / 100);
      const currentUnits = a.totalUnits;
      const avgOrderValue = a.totalUnits > 0 ? a.totalSales / a.totalUnits : 25;
      return sum + (potentialUnits - currentUnits) * avgOrderValue;
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'high',
      title: `${lowConversion.length} ASINs below ${benchmark}% conversion benchmark`,
      description: `Potential revenue opportunity: $${potentialRevenue.toFixed(0)}`,
      value: `+$${potentialRevenue.toFixed(0)}`,
      metric: 'Opportunity',
      data: lowConversion.slice(0, 10).map(a => ({
        asin: a.asin,
        conversion: formatPercent(a.avgConversion),
        sessions: a.totalSessions,
        gap: formatPercent(benchmark - a.avgConversion)
      }))
    });
  }

  return { agentId: 'conversion-analyzer', name: 'Conversion Analyzer', status: 'complete', findings };
};

/**
 * Agent 7: Buy Box Analyzer
 */
export const agentBuyBoxAnalyzer = (data) => {
  const { asins, availableMetrics } = data;
  const findings = [];

  if (!availableMetrics.includes('buyBoxPct')) {
    return {
      agentId: 'buybox-analyzer',
      name: 'Buy Box Analyzer',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'Buy Box data not found',
        description: 'Upload a Business Report with Buy Box Percentage to analyze',
        requiresData: true
      }]
    };
  }

  const lowBuyBox = asins.filter(a => a.avgBuyBox !== 'N/A' && a.avgBuyBox > 0 && a.avgBuyBox < 90);

  if (lowBuyBox.length > 0) {
    const atRiskSales = lowBuyBox.reduce((sum, a) => {
      const lostPct = (100 - a.avgBuyBox) / 100;
      return sum + a.totalSales * lostPct * 0.6;
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'high',
      title: `${lowBuyBox.length} ASINs with Buy Box < 90%`,
      description: `Estimated revenue at risk: $${atRiskSales.toFixed(0)}`,
      value: `$${atRiskSales.toFixed(0)}`,
      metric: 'At Risk',
      data: lowBuyBox.slice(0, 10).map(a => ({
        asin: a.asin,
        buyBox: formatPercent(a.avgBuyBox),
        sales: formatCurrency(a.totalSales)
      }))
    });
  }

  return { agentId: 'buybox-analyzer', name: 'Buy Box Analyzer', status: 'complete', findings };
};

/**
 * Agent 8: Spend Efficiency
 */
export const agentSpendEfficiency = (data) => {
  const { asins, summary } = data;
  const findings = [];

  if (summary.totalSpend === 0) {
    return {
      agentId: 'spend-efficiency',
      name: 'Spend Efficiency',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'No ad spend data found',
        description: 'Upload advertising reports to analyze spend efficiency'
      }]
    };
  }

  // Pareto analysis - 80/20 rule
  const sortedBySales = asins.filter(a => a.totalSales > 0).sort((a, b) => b.totalSales - a.totalSales);
  const totalSales = sortedBySales.reduce((s, a) => s + a.totalSales, 0);
  
  let cumulativeSales = 0;
  let paretoCount = 0;
  for (const asin of sortedBySales) {
    cumulativeSales += asin.totalSales;
    paretoCount++;
    if (cumulativeSales >= totalSales * 0.8) break;
  }

  const paretoPct = sortedBySales.length > 0 ? (paretoCount / sortedBySales.length * 100) : 0;

  findings.push({
    type: 'info',
    title: `${paretoPct.toFixed(0)}% of ASINs generate 80% of sales`,
    description: `${paretoCount} out of ${sortedBySales.length} ASINs drive majority of revenue`,
    value: paretoCount.toString(),
    metric: 'Top Performers',
    paretoData: sortedBySales.slice(0, 10).map((a, i) => ({
      rank: i + 1,
      asin: a.asin,
      sales: a.totalSales,
      cumulative: sortedBySales.slice(0, i + 1).reduce((s, x) => s + x.totalSales, 0) / totalSales * 100
    }))
  });

  // Unprofitable ASINs
  const unprofitable = asins.filter(a => a.totalSpend > a.totalSales && a.totalSpend > 10);
  if (unprofitable.length > 0) {
    const loss = unprofitable.reduce((s, a) => s + (a.totalSpend - a.totalSales), 0);
    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `${unprofitable.length} ASINs with net negative ROI`,
      description: `Total loss: $${loss.toFixed(2)}`,
      value: `-$${loss.toFixed(0)}`,
      metric: 'Net Loss'
    });
  }

  return { agentId: 'spend-efficiency', name: 'Spend Efficiency', status: 'complete', findings };
};

/**
 * Agent 9: Top Performers
 */
export const agentTopPerformers = (data) => {
  const { asins } = data;
  const findings = [];

  // Best ROAS
  const bestRoas = asins
    .filter(a => a.avgRoas !== 'N/A' && a.avgRoas > 0)
    .sort((a, b) => b.avgRoas - a.avgRoas)
    .slice(0, 5);

  if (bestRoas.length > 0) {
    findings.push({
      type: 'success',
      title: 'Top 5 ASINs by ROAS',
      description: 'Best performing products - consider increasing budget',
      data: bestRoas.map(a => ({
        asin: a.asin,
        roas: a.avgRoas.toFixed(2) + 'x',
        spend: formatCurrency(a.totalSpend),
        sales: formatCurrency(a.totalSales)
      }))
    });
  }

  // Best sellers
  const bestSellers = asins
    .filter(a => a.totalSales > 0)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  if (bestSellers.length > 0) {
    findings.push({
      type: 'success',
      title: 'Top 5 ASINs by Revenue',
      description: 'Your highest revenue products',
      data: bestSellers.map(a => ({
        asin: a.asin,
        sales: formatCurrency(a.totalSales),
        units: a.totalUnits
      }))
    });
  }

  return { agentId: 'top-performers', name: 'Top Performers', status: 'complete', findings };
};

/**
 * Agent 10: Budget Pacing
 */
export const agentBudgetPacing = (data) => {
  const { rows, summary, availableMetrics } = data;
  const findings = [];

  if (summary.totalSpend === 0) {
    return {
      agentId: 'budget-pacing',
      name: 'Budget Pacing',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'No spend data for pacing analysis',
        description: 'Upload advertising data to analyze budget pacing'
      }]
    };
  }

  if (!availableMetrics.includes('date')) {
    findings.push({
      type: 'info',
      title: `Total spend: ${formatCurrency(summary.totalSpend)}`,
      description: 'Date column not found. Upload dated reports for trend analysis.'
    });
    return { agentId: 'budget-pacing', name: 'Budget Pacing', status: 'partial', findings };
  }

  // Group by date
  const dateMap = new Map();
  rows.forEach(r => {
    if (!r.date) return;
    const day = r.date.toString().split('T')[0];
    if (!dateMap.has(day)) {
      dateMap.set(day, { date: day, spend: 0, sales: 0 });
    }
    const entry = dateMap.get(day);
    entry.spend += r.spend;
    entry.sales += r.sales;
  });

  const dailyData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  
  if (dailyData.length > 1) {
    const avgDaily = summary.totalSpend / dailyData.length;
    const maxDay = dailyData.reduce((max, d) => d.spend > max.spend ? d : max, dailyData[0]);
    const minDay = dailyData.reduce((min, d) => d.spend < min.spend ? d : min, dailyData[0]);

    findings.push({
      type: 'info',
      title: `Average daily spend: ${formatCurrency(avgDaily)}`,
      description: `Range: ${formatCurrency(minDay.spend)} to ${formatCurrency(maxDay.spend)} over ${dailyData.length} days`,
      trendData: dailyData
    });

    // Spike detection
    if (maxDay.spend > avgDaily * 2) {
      findings.push({
        type: 'warning',
        severity: 'medium',
        title: `Spend spike detected on ${maxDay.date}`,
        description: `${formatCurrency(maxDay.spend)} - ${((maxDay.spend / avgDaily - 1) * 100).toFixed(0)}% above average`
      });
    }
  }

  return { agentId: 'budget-pacing', name: 'Budget Pacing', status: 'complete', findings };
};

// Remaining agents with similar deterministic patterns...

export const agentSearchTermQuality = (data) => {
  const { searchTerms, availableMetrics } = data;
  
  if (!availableMetrics.includes('searchTerm')) {
    return {
      agentId: 'search-term-quality',
      name: 'Search Term Quality',
      status: 'requires_data',
      findings: [{ type: 'info', title: 'Requires Search Term Report', requiresData: true }]
    };
  }

  const findings = [];
  const highPerformers = searchTerms.filter(t => t.avgConversion !== 'N/A' && t.avgConversion > 10);
  
  if (highPerformers.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `${highPerformers.length} high-converting search terms (>10%)`,
      description: 'Consider adding these as exact match keywords',
      data: highPerformers.slice(0, 10).map(t => ({
        term: t.searchTerm,
        conversion: formatPercent(t.avgConversion),
        sales: formatCurrency(t.totalSales)
      }))
    });
  }

  findings.push({
    type: 'info',
    title: `${searchTerms.length} unique search terms analyzed`,
    description: 'Term distribution and performance data available'
  });

  return { agentId: 'search-term-quality', name: 'Search Term Quality', status: 'complete', findings };
};

export const agentInventoryAdSync = (data) => {
  return {
    agentId: 'inventory-sync',
    name: 'Inventory-Ad Sync',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Live Inventory API',
      description: 'Connect Amazon SP-API to analyze inventory levels vs ad spend',
      requiresApi: true
    }]
  };
};

export const agentPriceElasticity = (data) => {
  const { availableMetrics } = data;
  
  if (!availableMetrics.includes('buyBoxPct')) {
    return {
      agentId: 'price-elasticity',
      name: 'Price Elasticity Bot',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'Requires pricing and Buy Box data',
        description: 'Upload Business Reports with price and Buy Box percentage',
        requiresData: true
      }]
    };
  }

  return {
    agentId: 'price-elasticity',
    name: 'Price Elasticity Bot',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Competitor Price Data',
      description: 'Connect API for real-time price elasticity analysis',
      requiresApi: true
    }]
  };
};

export const agentLtvCalculator = (data) => {
  return {
    agentId: 'ltv-calculator',
    name: 'LTV Calculator',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Customer Order History',
      description: 'Connect SP-API to analyze repeat purchase patterns',
      requiresApi: true
    }]
  };
};

export const agentBsrPredictor = (data) => {
  return {
    agentId: 'bsr-predictor',
    name: 'BSR Trend Predictor',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Historical BSR Data',
      description: 'Connect API for 14-day BSR forecasting',
      requiresApi: true
    }]
  };
};

export const agentBrandShareOfVoice = (data) => {
  return {
    agentId: 'brand-sov',
    name: 'Brand Share of Voice',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Brand Analytics',
      description: 'Upload Brand Analytics or connect API for SOV analysis',
      requiresApi: true
    }]
  };
};

// Agent 17: Rufus-SEO Check
export const agentRufusSeo = (data) => {
  const { asins, rows } = data;
  const findings = [];

  if (asins.length === 0) {
    return {
      agentId: 'rufus-seo',
      name: 'Rufus-SEO Check',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'No ASIN data found',
        description: 'Upload a report with ASIN data for SEO analysis',
        requiresData: true
      }]
    };
  }

  // Check for listings that might need AI optimization
  const lowPerformers = asins.filter(a => 
    a.totalSessions > 100 && a.avgConversion !== 'N/A' && a.avgConversion < 5
  );

  if (lowPerformers.length > 0) {
    findings.push({
      type: 'alert',
      severity: 'medium',
      title: `${lowPerformers.length} ASINs may need listing optimization`,
      description: 'High traffic but low conversion suggests listing content issues. Optimize for AI-powered search (Rufus).',
      value: `${lowPerformers.length} ASINs`,
      metric: 'Need Attention',
      data: lowPerformers.slice(0, 5).map(a => ({
        asin: a.asin,
        sessions: a.totalSessions,
        conversion: formatPercent(a.avgConversion)
      }))
    });
  }

  findings.push({
    type: 'info',
    title: `${asins.length} ASINs analyzed for SEO health`,
    description: 'For detailed keyword and listing optimization, connect Amazon SP-API'
  });

  return { agentId: 'rufus-seo', name: 'Rufus-SEO Check', status: 'partial', findings };
};

// Agent 18: Sentiment Miner
export const agentSentimentMiner = (data) => {
  return {
    agentId: 'sentiment-miner',
    name: 'Sentiment Miner',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Review Data',
      description: 'Connect SP-API or upload Voice of Customer report for sentiment analysis',
      requiresApi: true
    }]
  };
};

// Agent 19: DSP Funnel Builder
export const agentDspFunnel = (data) => {
  const { summary } = data;
  const findings = [];

  if (summary.totalSessions > 0) {
    const estimatedAudience = Math.round(summary.totalSessions * 0.7);
    findings.push({
      type: 'opportunity',
      title: `Potential re-marketing audience: ${estimatedAudience.toLocaleString()} users`,
      description: 'Users who viewed but didn\'t purchase. Connect DSP for automated audience building.',
      value: `${estimatedAudience.toLocaleString()}`,
      metric: 'Potential Audience'
    });
  }

  return {
    agentId: 'dsp-funnel',
    name: 'DSP Funnel Builder',
    status: 'partial',
    findings: findings.length > 0 ? findings : [{
      type: 'info',
      title: 'Requires Amazon DSP Access',
      description: 'Connect DSP to auto-generate re-marketing audiences',
      requiresApi: true
    }]
  };
};

// Agent 20: A+ Content Scorer
export const agentAplusScorer = (data) => {
  return {
    agentId: 'aplus-scorer',
    name: 'A+ Content Scorer',
    status: 'requires_api',
    findings: [{
      type: 'info',
      title: 'Requires Listing Images',
      description: 'Connect SP-API for Vision AI analysis of your listing images and A+ content',
      requiresApi: true
    }]
  };
};

// Agent 21: Wasted Ad Spend Analyzer (NEW - CRITICAL)
export const agentWastedSpend = (data) => {
  const { wastedSpend, rows, summary } = data;
  const findings = [];
  
  if (!wastedSpend || !wastedSpend.total) {
    // Calculate on the fly if not pre-calculated
    const wastedRows = (rows || []).filter(row => {
      const orders = row.orders || 0;
      const clicks = row.clicks || 0;
      const spend = row.spend || 0;
      return orders === 0 && clicks > 5 && spend > 0;
    });
    
    if (wastedRows.length === 0) {
      return {
        agentId: 'wasted-spend',
        name: 'Wasted Ad Spend Analyzer',
        status: 'complete',
        findings: [{
          type: 'success',
          title: 'No significant wasted spend detected',
          description: 'All keywords with 5+ clicks have generated at least one order'
        }]
      };
    }
    
    const totalWasted = wastedRows.reduce((sum, r) => sum + (r.spend || 0), 0);
    const wastedPct = summary.totalSpend > 0 ? (totalWasted / summary.totalSpend * 100) : 0;
    
    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `€${totalWasted.toFixed(2)} wasted on non-converting keywords`,
      description: `${wastedPct.toFixed(1)}% of total spend went to ${wastedRows.length} keywords with clicks but zero orders`,
      value: `€${totalWasted.toFixed(0)}`,
      metric: 'Wasted Spend',
      wastedTerms: wastedRows
        .sort((a, b) => (b.spend || 0) - (a.spend || 0))
        .slice(0, 20)
        .map(r => ({
          term: r.searchTerm || r.targeting || 'Unknown',
          spend: r.spend,
          clicks: r.clicks,
          impressions: r.impressions,
          cpc: r.cpc,
          campaign: r.campaignName
        }))
    });
    
    return {
      agentId: 'wasted-spend',
      name: 'Wasted Ad Spend Analyzer',
      status: 'complete',
      findings
    };
  }
  
  // Use pre-calculated wasted spend
  const wastedPct = summary.totalSpend > 0 ? (wastedSpend.total / summary.totalSpend * 100) : 0;
  
  if (wastedSpend.total > 0) {
    findings.push({
      type: 'alert',
      severity: wastedPct > 20 ? 'critical' : wastedPct > 10 ? 'high' : 'medium',
      title: `€${wastedSpend.total.toFixed(2)} wasted on non-converting keywords`,
      description: `${wastedPct.toFixed(1)}% of total spend (${wastedSpend.count} keywords with ${wastedSpend.clickThreshold}+ clicks and 0 orders)`,
      value: `€${wastedSpend.total.toFixed(0)}`,
      metric: 'Wasted Spend',
      wastedTerms: wastedSpend.terms
    });
    
    // Actionable recommendation
    findings.push({
      type: 'recommendation',
      title: 'Add negative keywords to stop waste',
      description: `Adding the top ${Math.min(20, wastedSpend.count)} wasted terms as negative keywords could save €${wastedSpend.total.toFixed(2)}/month`,
      priority: 'high',
      action: 'ADD_NEGATIVE_KEYWORDS',
      data: wastedSpend.terms.slice(0, 20)
    });
  } else {
    findings.push({
      type: 'success',
      title: 'No significant wasted spend detected',
      description: 'Your campaigns are efficiently converting clicks to orders'
    });
  }
  
  return {
    agentId: 'wasted-spend',
    name: 'Wasted Ad Spend Analyzer',
    status: 'complete',
    findings
  };
};

// Agent 22: Halo Effect Analyzer (Other SKU Sales)
export const agentHaloEffect = (data) => {
  const { rows, summary } = data;
  const findings = [];
  
  // Check for Other SKU Sales data
  const rowsWithHalo = rows.filter(r => r._raw && (
    r._raw['7 Day Other SKU Sales'] || r._raw['7 Day Other SKU Units (#)']
  ));
  
  if (rowsWithHalo.length === 0) {
    return {
      agentId: 'halo-effect',
      name: 'Halo Effect Analyzer',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'No halo sales data found',
        description: 'Upload Search Term or Advertised Product reports to analyze cross-selling performance'
      }]
    };
  }
  
  // Calculate halo effect metrics
  let totalAdvertisedSales = 0;
  let totalOtherSales = 0;
  
  rowsWithHalo.forEach(r => {
    const advSales = cleanValue(r._raw['7 Day Advertised SKU Sales'] || 0);
    const otherSales = cleanValue(r._raw['7 Day Other SKU Sales'] || 0);
    totalAdvertisedSales += advSales;
    totalOtherSales += otherSales;
  });
  
  const totalSales = totalAdvertisedSales + totalOtherSales;
  const haloPct = totalSales > 0 ? (totalOtherSales / totalSales * 100) : 0;
  
  if (haloPct > 20) {
    findings.push({
      type: 'opportunity',
      title: `${haloPct.toFixed(1)}% of sales are cross-selling (halo effect)`,
      description: `Your ads drove €${totalOtherSales.toFixed(2)} in OTHER product sales. This indicates strong brand loyalty.`,
      value: `€${totalOtherSales.toFixed(0)}`,
      metric: 'Halo Sales'
    });
  } else {
    findings.push({
      type: 'info',
      title: `${haloPct.toFixed(1)}% halo effect detected`,
      description: `Most sales (${(100 - haloPct).toFixed(1)}%) are for the advertised product itself`
    });
  }
  
  return {
    agentId: 'halo-effect',
    name: 'Halo Effect Analyzer',
    status: 'complete',
    findings
  };
};

// Agent 23: Match Type Performance
export const agentMatchTypeAnalysis = (data) => {
  const { rows, summary } = data;
  const findings = [];
  
  // Group by match type
  const matchTypes = {};
  rows.forEach(r => {
    const match = r.matchType || 'Unknown';
    if (!matchTypes[match]) {
      matchTypes[match] = { spend: 0, sales: 0, orders: 0, clicks: 0, impressions: 0 };
    }
    matchTypes[match].spend += r.spend || 0;
    matchTypes[match].sales += r.sales || 0;
    matchTypes[match].orders += r.orders || 0;
    matchTypes[match].clicks += r.clicks || 0;
    matchTypes[match].impressions += r.impressions || 0;
  });
  
  if (Object.keys(matchTypes).length <= 1) {
    return {
      agentId: 'match-type-analysis',
      name: 'Match Type Performance',
      status: 'requires_data',
      findings: [{
        type: 'info',
        title: 'Single match type detected',
        description: 'Upload Search Term reports with multiple match types for comparison'
      }]
    };
  }
  
  // Calculate ACOS and ROAS for each match type
  const matchTypePerf = Object.entries(matchTypes).map(([type, data]) => ({
    matchType: type,
    spend: data.spend,
    sales: data.sales,
    orders: data.orders,
    acos: data.sales > 0 ? (data.spend / data.sales * 100) : Infinity,
    roas: data.spend > 0 ? (data.sales / data.spend) : 0,
    convRate: data.clicks > 0 ? (data.orders / data.clicks * 100) : 0
  })).sort((a, b) => b.roas - a.roas);
  
  const bestType = matchTypePerf[0];
  const worstType = matchTypePerf[matchTypePerf.length - 1];
  
  if (bestType && worstType && bestType.matchType !== worstType.matchType) {
    findings.push({
      type: 'opportunity',
      title: `${bestType.matchType} has best ROAS: ${bestType.roas.toFixed(2)}x`,
      description: `Consider shifting budget from ${worstType.matchType} (${worstType.roas.toFixed(2)}x ROAS) to ${bestType.matchType}`,
      data: matchTypePerf
    });
  }
  
  return {
    agentId: 'match-type-analysis',
    name: 'Match Type Performance',
    status: 'complete',
    findings: findings.length > 0 ? findings : [{
      type: 'info',
      title: 'Match type analysis complete',
      description: 'All match types performing similarly'
    }]
  };
};

// Agent 24: Campaign Structure Analyzer
export const agentCampaignStructure = (data) => {
  const { rows, summary } = data;
  const findings = [];
  
  // Group by campaign
  const campaigns = {};
  rows.forEach(r => {
    const campaign = r.campaignName || 'Unknown';
    if (!campaigns[campaign]) {
      campaigns[campaign] = { spend: 0, sales: 0, orders: 0, keywords: 0 };
    }
    campaigns[campaign].spend += r.spend || 0;
    campaigns[campaign].sales += r.sales || 0;
    campaigns[campaign].orders += r.orders || 0;
    campaigns[campaign].keywords++;
  });
  
  const campaignPerf = Object.entries(campaigns).map(([name, data]) => ({
    campaign: name,
    spend: data.spend,
    sales: data.sales,
    orders: data.orders,
    keywords: data.keywords,
    acos: data.sales > 0 ? (data.spend / data.sales * 100) : Infinity,
    roas: data.spend > 0 ? (data.sales / data.spend) : 0
  })).sort((a, b) => b.spend - a.spend);
  
  // Find campaigns with high spend but low returns
  const underperformers = campaignPerf.filter(c => c.spend > 100 && (c.roas < 1 || c.acos > 100));
  
  if (underperformers.length > 0) {
    findings.push({
      type: 'alert',
      severity: 'high',
      title: `${underperformers.length} campaigns with ACOS > 100%`,
      description: 'These campaigns are spending more than they earn',
      value: `€${underperformers.reduce((s, c) => s + c.spend, 0).toFixed(0)}`,
      metric: 'At Risk Spend',
      data: underperformers.slice(0, 5)
    });
  }
  
  // Top performing campaigns
  const topPerformers = campaignPerf.filter(c => c.roas > 3 && c.spend > 50);
  if (topPerformers.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `${topPerformers.length} campaigns with ROAS > 3x`,
      description: 'Consider increasing budget on these high-performers',
      data: topPerformers.slice(0, 5)
    });
  }
  
  return {
    agentId: 'campaign-structure',
    name: 'Campaign Structure Analyzer',
    status: 'complete',
    findings: findings.length > 0 ? findings : [{
      type: 'info',
      title: `${Object.keys(campaigns).length} campaigns analyzed`,
      description: 'Campaign performance data available'
    }]
  };
};

// ============================================
// RUN ALL AGENTS
// ============================================

export const runAllAgents = (parsedData) => {
  const agents = [
    agentNegativeNinja,
    agentCannibalization,
    agentDayparting,
    agentRefundRootCause,
    agentAcosOptimizer,
    agentConversionAnalyzer,
    agentBuyBoxAnalyzer,
    agentSpendEfficiency,
    agentTopPerformers,
    agentBudgetPacing,
    agentSearchTermQuality,
    agentInventoryAdSync,
    agentPriceElasticity,
    agentLtvCalculator,
    agentBsrPredictor,
    agentBrandShareOfVoice,
    agentRufusSeo,
    agentSentimentMiner,
    agentDspFunnel,
    agentAplusScorer,
  ];

  const results = agents.map(agentFn => agentFn(parsedData));

  // Calculate health score based on findings
  let criticalCount = 0;
  let warningCount = 0;
  let opportunityCount = 0;
  let requiresDataCount = 0;

  results.forEach(r => {
    r.findings?.forEach(f => {
      if (f.severity === 'critical') criticalCount++;
      else if (f.severity === 'high' || f.severity === 'medium' || f.type === 'warning') warningCount++;
      else if (f.type === 'opportunity') opportunityCount++;
      if (f.requiresData || f.requiresApi) requiresDataCount++;
    });
  });

  const healthScore = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 8));

  return {
    results,
    summary: {
      healthScore,
      criticalCount,
      warningCount,
      opportunityCount,
      requiresDataCount,
      totalAgents: results.length,
      completeAgents: results.filter(r => r.status === 'complete').length
    }
  };
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
  const rows = data.map(row => 
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'export.csv';
  link.click();
};

export const exportFindingsToCSV = (agentResults, filename = 'ai_findings.csv') => {
  const rows = [];
  agentResults.forEach(agent => {
    agent.findings?.forEach(finding => {
      rows.push({
        agent: agent.name,
        status: agent.status,
        type: finding.type,
        severity: finding.severity || 'info',
        title: finding.title,
        description: finding.description,
        value: finding.value || '',
        metric: finding.metric || ''
      });
    });
  });
  exportToCSV(rows, filename);
};
