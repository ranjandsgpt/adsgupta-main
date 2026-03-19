/**
 * AI Analysis Engine - Real calculations, no hallucinations
 * All metrics are computed from actual uploaded data
 */

// Utility functions for safe number parsing
export const safeNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'string' 
    ? parseFloat(val.replace(/[$,%]/g, '').replace(/,/g, ''))
    : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export const safeInt = (val) => Math.round(safeNumber(val));

// Field name normalization (handle different CSV formats)
const normalizeFieldName = (field) => {
  if (!field) return '';
  return field.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Get field value with multiple possible names
const getField = (row, possibleNames) => {
  for (const name of possibleNames) {
    const normalized = normalizeFieldName(name);
    for (const key of Object.keys(row)) {
      if (normalizeFieldName(key) === normalized || 
          key.toLowerCase().includes(name.toLowerCase())) {
        return row[key];
      }
    }
  }
  return null;
};

/**
 * Parse and normalize uploaded data
 */
export const parseUploadedData = (rawData) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return { rows: [], summary: null, asins: [], searchTerms: [] };
  }

  const rows = rawData.map((row, index) => {
    // Extract common Amazon report fields
    const parsed = {
      _index: index,
      // Identifiers
      asin: getField(row, ['asin', 'parent_asin', 'child_asin', 'ASIN']) || `ROW-${index}`,
      sku: getField(row, ['sku', 'SKU', 'seller_sku']),
      date: getField(row, ['date', 'Date', 'report_date']),
      
      // Search Term Report fields
      searchTerm: getField(row, ['search_term', 'customer_search_term', 'keyword', 'query']),
      campaignName: getField(row, ['campaign_name', 'campaign']),
      adGroupName: getField(row, ['ad_group_name', 'ad_group']),
      matchType: getField(row, ['match_type', 'targeting_type']),
      
      // Traffic metrics
      sessions: safeInt(getField(row, ['sessions', 'Sessions', 'page_views'])),
      pageViews: safeInt(getField(row, ['page_views', 'pageViews', 'Page Views'])),
      impressions: safeInt(getField(row, ['impressions', 'Impressions'])),
      clicks: safeInt(getField(row, ['clicks', 'Clicks'])),
      
      // Sales metrics
      sales: safeNumber(getField(row, ['ordered_product_sales', 'sales', 'Sales', '7_day_total_sales', 'total_sales'])),
      units: safeInt(getField(row, ['units_ordered', 'units', 'Units', '7_day_total_units', 'total_units'])),
      orders: safeInt(getField(row, ['total_order_items', 'orders', 'Orders', '7_day_total_orders'])),
      
      // PPC metrics
      spend: safeNumber(getField(row, ['spend', 'Spend', 'cost', 'ad_spend'])),
      
      // Conversion & Buy Box
      conversionRate: safeNumber(getField(row, ['unit_session_percentage', 'conversion_rate', 'Unit Session Percentage'])),
      buyBoxPct: safeNumber(getField(row, ['buy_box_percentage', 'Buy Box Percentage', 'featured_offer'])),
      
      // Raw row for reference
      _raw: row
    };

    // Calculate derived metrics
    parsed.ctr = parsed.impressions > 0 ? (parsed.clicks / parsed.impressions * 100) : 0;
    parsed.cpc = parsed.clicks > 0 ? (parsed.spend / parsed.clicks) : 0;
    parsed.acos = parsed.sales > 0 ? (parsed.spend / parsed.sales * 100) : (parsed.spend > 0 ? 100 : 0);
    parsed.roas = parsed.spend > 0 ? (parsed.sales / parsed.spend) : 0;
    parsed.conversionRate = parsed.conversionRate || (parsed.sessions > 0 ? (parsed.units / parsed.sessions * 100) : 0);

    return parsed;
  });

  // Calculate summary
  const summary = calculateSummary(rows);
  
  // Group by ASIN
  const asinMap = new Map();
  rows.forEach(row => {
    if (!row.asin) return;
    if (!asinMap.has(row.asin)) {
      asinMap.set(row.asin, []);
    }
    asinMap.get(row.asin).push(row);
  });

  const asins = Array.from(asinMap.entries()).map(([asin, asinRows]) => ({
    asin,
    rowCount: asinRows.length,
    ...calculateSummary(asinRows)
  })).sort((a, b) => b.totalSales - a.totalSales);

  // Group search terms (for Search Term Reports)
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
    rowCount: termRows.length,
    ...calculateSummary(termRows)
  })).sort((a, b) => b.totalSpend - a.totalSpend);

  return { rows, summary, asins, searchTerms };
};

/**
 * Calculate summary metrics from rows
 */
export const calculateSummary = (rows) => {
  if (!rows || rows.length === 0) {
    return {
      totalSales: 0, totalUnits: 0, totalSessions: 0, totalPageViews: 0,
      totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalOrders: 0,
      avgConversion: 0, avgBuyBox: 0, avgAcos: 0, avgRoas: 0, avgCtr: 0, avgCpc: 0
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
    conversionSum: acc.conversionSum + row.conversionRate,
    buyBoxSum: acc.buyBoxSum + row.buyBoxPct,
  }), {
    sales: 0, units: 0, sessions: 0, pageViews: 0,
    impressions: 0, clicks: 0, spend: 0, orders: 0,
    conversionSum: 0, buyBoxSum: 0
  });

  const rowCount = rows.length;
  const rowsWithConversion = rows.filter(r => r.conversionRate > 0).length || 1;
  const rowsWithBuyBox = rows.filter(r => r.buyBoxPct > 0).length || 1;

  return {
    totalSales: Math.round(totals.sales * 100) / 100,
    totalUnits: totals.units,
    totalSessions: totals.sessions,
    totalPageViews: totals.pageViews,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalSpend: Math.round(totals.spend * 100) / 100,
    totalOrders: totals.orders,
    avgConversion: Math.round((totals.conversionSum / rowsWithConversion) * 100) / 100,
    avgBuyBox: Math.round((totals.buyBoxSum / rowsWithBuyBox) * 100) / 100,
    avgAcos: totals.sales > 0 ? Math.round((totals.spend / totals.sales * 100) * 100) / 100 : 0,
    avgRoas: totals.spend > 0 ? Math.round((totals.sales / totals.spend) * 100) / 100 : 0,
    avgCtr: totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions * 100) * 100) / 100 : 0,
    avgCpc: totals.clicks > 0 ? Math.round((totals.spend / totals.clicks) * 100) / 100 : 0,
    rowCount
  };
};

/**
 * AI AGENT CALCULATIONS - Real analysis, no hallucinations
 * Each agent returns findings based on actual data patterns
 */

// 1. Negative Ninja - Find 0% conversion search terms
export const analyzeNegativeKeywords = (data) => {
  const { searchTerms, rows, summary } = data;
  const findings = [];

  // Find search terms with spend but 0 conversions
  const zeroConversionTerms = searchTerms.filter(t => 
    t.totalSpend > 0 && t.totalUnits === 0 && t.totalOrders === 0
  );

  if (zeroConversionTerms.length > 0) {
    const wastedSpend = zeroConversionTerms.reduce((sum, t) => sum + t.totalSpend, 0);
    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `${zeroConversionTerms.length} search terms with 0% conversion`,
      description: `These terms consumed $${wastedSpend.toFixed(2)} with zero sales`,
      value: `-$${wastedSpend.toFixed(2)}`,
      metric: 'Wasted Spend',
      details: zeroConversionTerms.slice(0, 10).map(t => ({
        term: t.searchTerm,
        spend: t.totalSpend,
        clicks: t.totalClicks,
        impressions: t.totalImpressions
      }))
    });
  }

  // Find low conversion terms (< 1%)
  const lowConversionTerms = searchTerms.filter(t => 
    t.totalSpend > 5 && t.avgConversion > 0 && t.avgConversion < 1
  );

  if (lowConversionTerms.length > 0) {
    findings.push({
      type: 'warning',
      severity: 'medium',
      title: `${lowConversionTerms.length} terms with <1% conversion`,
      description: 'Consider adding as negative or reducing bids',
      details: lowConversionTerms.slice(0, 10).map(t => ({
        term: t.searchTerm,
        conversion: t.avgConversion,
        spend: t.totalSpend
      }))
    });
  }

  if (findings.length === 0) {
    findings.push({
      type: 'success',
      title: 'No critical negative keyword issues found',
      description: 'Your search terms are converting well'
    });
  }

  return { agentId: 'negative-ninja', findings };
};

// 2. ACOS Analyzer - Find high ACOS products/terms
export const analyzeAcos = (data) => {
  const { asins, searchTerms, summary } = data;
  const findings = [];
  const targetAcos = 30; // Industry standard target

  // High ACOS ASINs
  const highAcosAsins = asins.filter(a => a.avgAcos > targetAcos && a.totalSpend > 10);
  if (highAcosAsins.length > 0) {
    const excessSpend = highAcosAsins.reduce((sum, a) => {
      const idealSpend = a.totalSales * (targetAcos / 100);
      return sum + Math.max(0, a.totalSpend - idealSpend);
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `${highAcosAsins.length} ASINs with ACOS > ${targetAcos}%`,
      description: `Excess spend above target: $${excessSpend.toFixed(2)}`,
      value: `${summary.avgAcos.toFixed(1)}%`,
      metric: 'Avg ACOS',
      details: highAcosAsins.slice(0, 10).map(a => ({
        asin: a.asin,
        acos: a.avgAcos,
        spend: a.totalSpend,
        sales: a.totalSales
      }))
    });
  }

  // ASINs with good ACOS
  const goodAcosAsins = asins.filter(a => a.avgAcos > 0 && a.avgAcos <= targetAcos && a.totalSpend > 10);
  if (goodAcosAsins.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `${goodAcosAsins.length} ASINs with healthy ACOS`,
      description: 'Consider increasing budget on these profitable ASINs',
      details: goodAcosAsins.slice(0, 5).map(a => ({
        asin: a.asin,
        acos: a.avgAcos,
        roas: a.avgRoas
      }))
    });
  }

  return { agentId: 'acos-analyzer', findings };
};

// 3. Conversion Rate Analyzer
export const analyzeConversion = (data) => {
  const { asins, summary } = data;
  const findings = [];
  const benchmarkConversion = 10; // 10% is good for Amazon

  // Low conversion ASINs with traffic
  const lowConversionAsins = asins.filter(a => 
    a.totalSessions > 50 && a.avgConversion < benchmarkConversion && a.avgConversion > 0
  );

  if (lowConversionAsins.length > 0) {
    const potentialSales = lowConversionAsins.reduce((sum, a) => {
      const potentialUnits = a.totalSessions * (benchmarkConversion / 100);
      const actualUnits = a.totalUnits;
      return sum + (potentialUnits - actualUnits) * (a.totalSales / Math.max(a.totalUnits, 1));
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'high',
      title: `${lowConversionAsins.length} ASINs below ${benchmarkConversion}% conversion`,
      description: `Potential lost revenue: $${potentialSales.toFixed(2)}`,
      value: `$${potentialSales.toFixed(0)}`,
      metric: 'Opportunity',
      details: lowConversionAsins.slice(0, 10).map(a => ({
        asin: a.asin,
        conversion: a.avgConversion,
        sessions: a.totalSessions,
        gap: (benchmarkConversion - a.avgConversion).toFixed(2)
      }))
    });
  }

  // High performers
  const highConversionAsins = asins.filter(a => a.avgConversion >= benchmarkConversion);
  if (highConversionAsins.length > 0) {
    findings.push({
      type: 'success',
      title: `${highConversionAsins.length} ASINs performing above benchmark`,
      description: `Average conversion: ${(highConversionAsins.reduce((s, a) => s + a.avgConversion, 0) / highConversionAsins.length).toFixed(2)}%`
    });
  }

  return { agentId: 'conversion-analyzer', findings };
};

// 4. Buy Box Analyzer
export const analyzeBuyBox = (data) => {
  const { asins, summary } = data;
  const findings = [];

  const lowBuyBoxAsins = asins.filter(a => a.avgBuyBox > 0 && a.avgBuyBox < 90);
  
  if (lowBuyBoxAsins.length > 0) {
    const potentialLoss = lowBuyBoxAsins.reduce((sum, a) => {
      const lostPct = (100 - a.avgBuyBox) / 100;
      return sum + (a.totalSales * lostPct * 0.5); // Estimate 50% of lost buy box = lost sales
    }, 0);

    findings.push({
      type: 'alert',
      severity: 'high',
      title: `${lowBuyBoxAsins.length} ASINs with Buy Box < 90%`,
      description: `Estimated revenue at risk: $${potentialLoss.toFixed(2)}`,
      value: `$${potentialLoss.toFixed(0)}`,
      metric: 'At Risk',
      details: lowBuyBoxAsins.slice(0, 10).map(a => ({
        asin: a.asin,
        buyBox: a.avgBuyBox,
        sales: a.totalSales
      }))
    });
  }

  if (summary.avgBuyBox >= 90) {
    findings.push({
      type: 'success',
      title: 'Buy Box performance is healthy',
      description: `Average Buy Box: ${summary.avgBuyBox.toFixed(1)}%`
    });
  }

  return { agentId: 'buybox-analyzer', findings };
};

// 5. Traffic Analyzer
export const analyzeTraffic = (data) => {
  const { asins, rows, summary } = data;
  const findings = [];

  // ASINs with high impressions but low clicks (poor CTR)
  const lowCtrAsins = asins.filter(a => 
    a.totalImpressions > 1000 && a.avgCtr < 0.3
  );

  if (lowCtrAsins.length > 0) {
    findings.push({
      type: 'alert',
      severity: 'medium',
      title: `${lowCtrAsins.length} ASINs with CTR < 0.3%`,
      description: 'Main image or title may need optimization',
      details: lowCtrAsins.slice(0, 10).map(a => ({
        asin: a.asin,
        ctr: a.avgCtr,
        impressions: a.totalImpressions,
        clicks: a.totalClicks
      }))
    });
  }

  // High traffic, low sales
  const highTrafficLowSales = asins.filter(a =>
    a.totalSessions > 100 && a.totalSales < 50
  );

  if (highTrafficLowSales.length > 0) {
    findings.push({
      type: 'warning',
      title: `${highTrafficLowSales.length} ASINs with traffic but low sales`,
      description: 'Check pricing, reviews, or listing quality',
      details: highTrafficLowSales.slice(0, 5).map(a => ({
        asin: a.asin,
        sessions: a.totalSessions,
        sales: a.totalSales
      }))
    });
  }

  return { agentId: 'traffic-analyzer', findings };
};

// 6. Spend Efficiency Analyzer
export const analyzeSpendEfficiency = (data) => {
  const { asins, searchTerms, summary } = data;
  const findings = [];

  // Calculate spend distribution
  const totalSpend = summary.totalSpend;
  if (totalSpend === 0) {
    findings.push({
      type: 'info',
      title: 'No ad spend data found',
      description: 'Upload a Search Term or Advertising report to analyze spend'
    });
    return { agentId: 'spend-efficiency', findings };
  }

  // Top spenders
  const topSpenders = asins.filter(a => a.totalSpend > 0).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);
  const top5Spend = topSpenders.reduce((s, a) => s + a.totalSpend, 0);
  const top5Pct = (top5Spend / totalSpend * 100).toFixed(1);

  findings.push({
    type: 'info',
    title: `Top 5 ASINs account for ${top5Pct}% of spend`,
    description: `Total: $${top5Spend.toFixed(2)} of $${totalSpend.toFixed(2)}`,
    details: topSpenders.map(a => ({
      asin: a.asin,
      spend: a.totalSpend,
      sales: a.totalSales,
      acos: a.avgAcos
    }))
  });

  // Unprofitable spend
  const unprofitableSpend = asins.filter(a => a.totalSpend > 0 && a.avgAcos > 100);
  if (unprofitableSpend.length > 0) {
    const lossAmount = unprofitableSpend.reduce((s, a) => s + (a.totalSpend - a.totalSales), 0);
    findings.push({
      type: 'alert',
      severity: 'critical',
      title: `${unprofitableSpend.length} ASINs spending more than revenue`,
      description: `Net loss: $${lossAmount.toFixed(2)}`,
      value: `-$${lossAmount.toFixed(0)}`,
      metric: 'Loss'
    });
  }

  return { agentId: 'spend-efficiency', findings };
};

// 7. Top Performers Analyzer
export const analyzeTopPerformers = (data) => {
  const { asins, summary } = data;
  const findings = [];

  // Best ROAS
  const bestRoas = asins.filter(a => a.avgRoas > 0).sort((a, b) => b.avgRoas - a.avgRoas).slice(0, 5);
  if (bestRoas.length > 0) {
    findings.push({
      type: 'opportunity',
      title: 'Top 5 ASINs by ROAS',
      description: 'Consider increasing budget on these performers',
      details: bestRoas.map(a => ({
        asin: a.asin,
        roas: a.avgRoas,
        spend: a.totalSpend,
        sales: a.totalSales
      }))
    });
  }

  // Best conversion
  const bestConversion = asins.filter(a => a.avgConversion > 0 && a.totalSessions > 20)
    .sort((a, b) => b.avgConversion - a.avgConversion).slice(0, 5);
  if (bestConversion.length > 0) {
    findings.push({
      type: 'success',
      title: 'Top 5 ASINs by Conversion Rate',
      description: 'Your best converting products',
      details: bestConversion.map(a => ({
        asin: a.asin,
        conversion: a.avgConversion,
        sessions: a.totalSessions,
        units: a.totalUnits
      }))
    });
  }

  return { agentId: 'top-performers', findings };
};

// 8. Cannibalization Detector
export const analyzeCannibalization = (data) => {
  const { asins, summary } = data;
  const findings = [];

  // Estimate organic cannibalization
  // If ACOS is very low (< 10%), ads might be cannibalizing organic
  const potentialCannibalization = asins.filter(a => 
    a.avgAcos > 0 && a.avgAcos < 10 && a.totalSpend > 20
  );

  if (potentialCannibalization.length > 0) {
    const estimatedWaste = potentialCannibalization.reduce((s, a) => s + a.totalSpend * 0.3, 0);
    findings.push({
      type: 'warning',
      title: `${potentialCannibalization.length} ASINs may have ad cannibalization`,
      description: `Very low ACOS suggests you may be paying for organic sales. Estimated waste: $${estimatedWaste.toFixed(2)}`,
      value: `~$${estimatedWaste.toFixed(0)}`,
      metric: 'Potential Waste',
      details: potentialCannibalization.map(a => ({
        asin: a.asin,
        acos: a.avgAcos,
        spend: a.totalSpend
      }))
    });
  }

  return { agentId: 'cannibalization', findings };
};

// 9. Budget Pacing
export const analyzeBudgetPacing = (data) => {
  const { rows, summary } = data;
  const findings = [];

  if (summary.totalSpend === 0) {
    findings.push({
      type: 'info',
      title: 'No spend data to analyze pacing',
      description: 'Upload advertising data to see budget pacing'
    });
    return { agentId: 'budget-pacing', findings };
  }

  // Calculate daily spend if dates are available
  const dateMap = new Map();
  rows.forEach(r => {
    if (r.date) {
      const day = r.date.split('T')[0];
      dateMap.set(day, (dateMap.get(day) || 0) + r.spend);
    }
  });

  if (dateMap.size > 1) {
    const dailySpends = Array.from(dateMap.values());
    const avgDailySpend = dailySpends.reduce((s, v) => s + v, 0) / dailySpends.length;
    const maxDailySpend = Math.max(...dailySpends);
    const minDailySpend = Math.min(...dailySpends);

    findings.push({
      type: 'info',
      title: `Daily spend varies from $${minDailySpend.toFixed(0)} to $${maxDailySpend.toFixed(0)}`,
      description: `Average: $${avgDailySpend.toFixed(2)}/day over ${dateMap.size} days`,
      value: `$${avgDailySpend.toFixed(0)}/day`,
      metric: 'Avg Spend'
    });

    if (maxDailySpend > avgDailySpend * 2) {
      findings.push({
        type: 'warning',
        title: 'High spend variance detected',
        description: 'Some days spent 2x+ the average - check for budget spikes'
      });
    }
  }

  return { agentId: 'budget-pacing', findings };
};

// 10. Search Term Quality Analyzer
export const analyzeSearchTermQuality = (data) => {
  const { searchTerms, summary } = data;
  const findings = [];

  if (searchTerms.length === 0) {
    findings.push({
      type: 'info',
      title: 'No search term data found',
      description: 'Upload a Search Term Report for keyword analysis'
    });
    return { agentId: 'search-term-quality', findings };
  }

  // High performing search terms
  const highPerformers = searchTerms.filter(t => t.avgConversion > 10 && t.totalSpend > 5);
  if (highPerformers.length > 0) {
    findings.push({
      type: 'opportunity',
      title: `${highPerformers.length} high-converting search terms`,
      description: 'Consider adding as exact match keywords',
      details: highPerformers.slice(0, 10).map(t => ({
        term: t.searchTerm,
        conversion: t.avgConversion,
        sales: t.totalSales
      }))
    });
  }

  // Branded vs non-branded estimate
  const brandedTerms = searchTerms.filter(t => {
    const term = t.searchTerm?.toLowerCase() || '';
    return term.includes('brand') || term.length < 15;
  });
  const brandedPct = (brandedTerms.length / searchTerms.length * 100).toFixed(1);

  findings.push({
    type: 'info',
    title: `${searchTerms.length} unique search terms analyzed`,
    description: `Mix analysis available for targeting optimization`
  });

  return { agentId: 'search-term-quality', findings };
};

/**
 * Run all AI agents on the data
 */
export const runAllAgents = (parsedData) => {
  const agents = [
    { id: 'negative-ninja', name: 'Negative Ninja', run: analyzeNegativeKeywords },
    { id: 'acos-analyzer', name: 'ACOS Analyzer', run: analyzeAcos },
    { id: 'conversion-analyzer', name: 'Conversion Analyzer', run: analyzeConversion },
    { id: 'buybox-analyzer', name: 'Buy Box Analyzer', run: analyzeBuyBox },
    { id: 'traffic-analyzer', name: 'Traffic Analyzer', run: analyzeTraffic },
    { id: 'spend-efficiency', name: 'Spend Efficiency', run: analyzeSpendEfficiency },
    { id: 'top-performers', name: 'Top Performers', run: analyzeTopPerformers },
    { id: 'cannibalization', name: 'Cannibalization Audit', run: analyzeCannibalization },
    { id: 'budget-pacing', name: 'Budget Pacing', run: analyzeBudgetPacing },
    { id: 'search-term-quality', name: 'Search Term Quality', run: analyzeSearchTermQuality },
  ];

  const results = agents.map(agent => ({
    ...agent,
    result: agent.run(parsedData)
  }));

  // Calculate overall health score
  let criticalCount = 0;
  let warningCount = 0;
  let opportunityCount = 0;

  results.forEach(r => {
    r.result.findings.forEach(f => {
      if (f.severity === 'critical') criticalCount++;
      else if (f.severity === 'high' || f.severity === 'medium' || f.type === 'warning') warningCount++;
      else if (f.type === 'opportunity') opportunityCount++;
    });
  });

  const healthScore = Math.max(0, 100 - (criticalCount * 15) - (warningCount * 5));

  return {
    results,
    summary: {
      healthScore,
      criticalCount,
      warningCount,
      opportunityCount,
      totalFindings: criticalCount + warningCount + opportunityCount
    }
  };
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'audit_report.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val ?? '';
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Export findings to CSV
 */
export const exportFindingsToCSV = (agentResults, filename = 'ai_findings.csv') => {
  const rows = [];
  
  agentResults.forEach(agent => {
    agent.result.findings.forEach(finding => {
      rows.push({
        agent: agent.name,
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
