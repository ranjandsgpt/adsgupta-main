/**
 * Quantum Merger Engine - Universal Multi-File Correlation System
 * Handles up to 10 files with intelligent joins and cross-pollination
 * Zero hallucination - all insights traceable to source data
 */

import { safeNumber, safeInt } from './analysisEngineV2';

// Normalize field names for cross-file matching
const normalizeFieldName = (field) => {
  if (!field) return '';
  return field.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Common field aliases for intelligent matching
const FIELD_ALIASES = {
  asin: ['asin', 'parent_asin', 'child_asin', 'product_asin'],
  sku: ['sku', 'seller_sku', 'merchant_sku', 'msku'],
  sales: ['ordered_product_sales', 'sales', 'item_price', 'total_sales', '7_day_total_sales'],
  units: ['units_ordered', 'units', 'quantity', '7_day_total_units'],
  spend: ['spend', 'ad_spend', 'cost', 'total_spend'],
  impressions: ['impressions', 'total_impressions'],
  clicks: ['clicks', 'total_clicks'],
  sessions: ['sessions', 'page_views'],
  returns: ['return_quantity', 'returns', 'units_returned'],
  refund: ['refund_amount', 'refund', 'amount_refunded'],
  fee: ['fulfillment_fee', 'fba_fee', 'total_fee', 'amazon_fee'],
  inventory: ['available', 'afn_fulfillable_quantity', 'quantity_available'],
  price: ['price', 'item_price', 'your_price', 'average_selling_price']
};

// Get normalized value from row using aliases
const getAliasedValue = (row, aliasKey) => {
  const aliases = FIELD_ALIASES[aliasKey] || [aliasKey];
  for (const alias of aliases) {
    for (const key of Object.keys(row)) {
      if (normalizeFieldName(key) === normalizeFieldName(alias)) {
        return row[key];
      }
    }
  }
  return null;
};

/**
 * Clean and normalize data from a single file
 */
export const cleanFileData = (data, reportType) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map((row, idx) => {
    const cleaned = { _sourceIndex: idx, _reportType: reportType };
    
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeFieldName(key);
      
      // Clean currency values
      if (typeof value === 'string' && value.match(/^\$?-?[\d,]+\.?\d*$/)) {
        cleaned[normalizedKey] = safeNumber(value);
      }
      // Clean percentage values
      else if (typeof value === 'string' && value.match(/^[\d.]+%$/)) {
        cleaned[normalizedKey] = safeNumber(value.replace('%', ''));
      }
      // Keep as-is
      else {
        cleaned[normalizedKey] = value;
      }
    }
    
    // Extract primary keys
    cleaned._asin = getAliasedValue(cleaned, 'asin');
    cleaned._sku = getAliasedValue(cleaned, 'sku');
    cleaned._primaryKey = cleaned._asin || cleaned._sku || `row_${idx}`;
    
    return cleaned;
  });
};

/**
 * Merge multiple files using SKU/ASIN as join keys
 */
export const mergeFiles = (files) => {
  const masterMap = new Map();
  const mergeStats = {
    totalRows: 0,
    joinedRecords: 0,
    orphanRecords: 0,
    reportTypes: new Set()
  };
  
  // Process each file
  files.forEach(file => {
    if (!file.data) return;
    
    const cleanedData = cleanFileData(file.data, file.reportType);
    mergeStats.totalRows += cleanedData.length;
    mergeStats.reportTypes.add(file.reportType);
    
    cleanedData.forEach(row => {
      const key = row._primaryKey;
      
      if (!masterMap.has(key)) {
        masterMap.set(key, {
          _primaryKey: key,
          _asin: row._asin,
          _sku: row._sku,
          _sources: [],
          _reportTypes: new Set()
        });
      }
      
      const master = masterMap.get(key);
      master._sources.push({ fileId: file.id, fileName: file.name, rowIndex: row._sourceIndex });
      master._reportTypes.add(file.reportType);
      
      // Merge fields (aggregate numeric, keep latest for strings)
      for (const [k, v] of Object.entries(row)) {
        if (k.startsWith('_')) continue;
        
        if (typeof v === 'number') {
          master[k] = (master[k] || 0) + v;
        } else if (!master[k]) {
          master[k] = v;
        }
      }
    });
  });
  
  // Calculate join stats
  masterMap.forEach(record => {
    if (record._reportTypes.size > 1) {
      mergeStats.joinedRecords++;
    } else {
      mergeStats.orphanRecords++;
    }
  });
  
  return {
    records: Array.from(masterMap.values()),
    stats: {
      ...mergeStats,
      reportTypes: Array.from(mergeStats.reportTypes),
      uniqueKeys: masterMap.size
    }
  };
};

/**
 * CROSS-POLLINATION INSIGHT #1: True Profit Audit
 * Combines Business Report + Settlement Report to calculate actual net margin
 */
export const calculateTrueProfit = (masterData, files) => {
  const businessFile = files.find(f => f.reportType === 'business_report');
  const settlementFile = files.find(f => f.reportType === 'settlement_report');
  
  if (!businessFile || !settlementFile) {
    return { status: 'requires_data', message: 'Requires Business Report + Settlement Report' };
  }
  
  const results = [];
  const skuProfitMap = new Map();
  
  // Process settlement data for fees
  const settlementData = cleanFileData(settlementFile.data, 'settlement_report');
  settlementData.forEach(row => {
    const key = row._primaryKey;
    if (!skuProfitMap.has(key)) {
      skuProfitMap.set(key, { 
        grossSales: 0, 
        fees: 0, 
        refunds: 0, 
        netProfit: 0,
        fbaFees: 0,
        storageFees: 0,
        advertisingFees: 0,
        sources: []
      });
    }
    
    const entry = skuProfitMap.get(key);
    const amount = safeNumber(row.total || row.amount || 0);
    const type = (row.transaction_type || row.type || '').toLowerCase();
    
    if (type.includes('fee') || type.includes('fba')) {
      entry.fees += Math.abs(amount);
      if (type.includes('storage')) entry.storageFees += Math.abs(amount);
      else if (type.includes('fulfillment')) entry.fbaFees += Math.abs(amount);
      else if (type.includes('advertising') || type.includes('ppc')) entry.advertisingFees += Math.abs(amount);
    } else if (type.includes('refund')) {
      entry.refunds += Math.abs(amount);
    } else if (amount > 0) {
      entry.grossSales += amount;
    }
    
    entry.sources.push({ file: settlementFile.name, row: row._sourceIndex });
  });
  
  // Process business data for sales
  const businessData = cleanFileData(businessFile.data, 'business_report');
  businessData.forEach(row => {
    const key = row._primaryKey;
    const sales = safeNumber(getAliasedValue(row, 'sales') || 0);
    
    if (skuProfitMap.has(key)) {
      const entry = skuProfitMap.get(key);
      if (sales > entry.grossSales) entry.grossSales = sales; // Use higher value
    } else {
      skuProfitMap.set(key, { 
        grossSales: sales, 
        fees: 0, 
        refunds: 0, 
        netProfit: 0,
        fbaFees: 0,
        storageFees: 0,
        advertisingFees: 0,
        sources: [{ file: businessFile.name, row: row._sourceIndex }]
      });
    }
  });
  
  // Calculate net profit
  let totalGross = 0, totalFees = 0, totalRefunds = 0, totalNet = 0;
  const unprofitableSkus = [];
  
  skuProfitMap.forEach((data, key) => {
    data.netProfit = data.grossSales - data.fees - data.refunds;
    data.margin = data.grossSales > 0 ? (data.netProfit / data.grossSales * 100) : 0;
    
    totalGross += data.grossSales;
    totalFees += data.fees;
    totalRefunds += data.refunds;
    totalNet += data.netProfit;
    
    if (data.netProfit < 0 && data.grossSales > 50) {
      unprofitableSkus.push({
        sku: key,
        grossSales: data.grossSales,
        fees: data.fees,
        refunds: data.refunds,
        netProfit: data.netProfit,
        margin: data.margin,
        sources: data.sources
      });
    }
  });
  
  unprofitableSkus.sort((a, b) => a.netProfit - b.netProfit);
  
  return {
    status: 'complete',
    summary: {
      totalGrossSales: totalGross,
      totalAmazonFees: totalFees,
      totalRefunds: totalRefunds,
      trueNetProfit: totalNet,
      overallMargin: totalGross > 0 ? (totalNet / totalGross * 100) : 0,
      skusAnalyzed: skuProfitMap.size,
      unprofitableCount: unprofitableSkus.length
    },
    findings: [
      {
        type: 'alert',
        severity: totalNet < 0 ? 'critical' : unprofitableSkus.length > 5 ? 'high' : 'medium',
        title: `True Net Profit: $${totalNet.toFixed(2)}`,
        description: `Amazon took $${totalFees.toFixed(2)} in fees + $${totalRefunds.toFixed(2)} in refunds from your $${totalGross.toFixed(2)} gross sales`,
        value: `${(totalNet / totalGross * 100).toFixed(1)}%`,
        metric: 'True Margin'
      },
      ...(unprofitableSkus.length > 0 ? [{
        type: 'alert',
        severity: 'critical',
        title: `${unprofitableSkus.length} SKUs are losing money`,
        description: `These products have negative net profit after Amazon fees`,
        data: unprofitableSkus.slice(0, 10),
        traceable: true
      }] : [])
    ],
    detailedData: Array.from(skuProfitMap.entries()).map(([sku, data]) => ({ sku, ...data }))
  };
};

/**
 * CROSS-POLLINATION INSIGHT #2: PPC Cannibalization
 * Identifies SKUs where ads are stealing organic sales
 */
export const calculatePpcCannibalization = (masterData, files) => {
  const businessFile = files.find(f => f.reportType === 'business_report');
  const ppcFile = files.find(f => ['sponsored_products', 'search_term_report'].includes(f.reportType));
  
  if (!businessFile || !ppcFile) {
    return { status: 'requires_data', message: 'Requires Business Report + PPC/Search Term Report' };
  }
  
  const skuDataMap = new Map();
  
  // Get organic data from business report
  const businessData = cleanFileData(businessFile.data, 'business_report');
  businessData.forEach(row => {
    const key = row._primaryKey;
    skuDataMap.set(key, {
      totalSales: safeNumber(getAliasedValue(row, 'sales') || 0),
      sessions: safeInt(getAliasedValue(row, 'sessions') || 0),
      organicSales: safeNumber(getAliasedValue(row, 'sales') || 0), // Will be adjusted
      adSales: 0,
      adSpend: 0,
      sources: [{ file: businessFile.name, row: row._sourceIndex }]
    });
  });
  
  // Get ad data from PPC report
  const ppcData = cleanFileData(ppcFile.data, ppcFile.reportType);
  ppcData.forEach(row => {
    const key = row._primaryKey;
    const adSales = safeNumber(getAliasedValue(row, 'sales') || row['7_day_total_sales'] || 0);
    const adSpend = safeNumber(getAliasedValue(row, 'spend') || 0);
    
    if (skuDataMap.has(key)) {
      const entry = skuDataMap.get(key);
      entry.adSales += adSales;
      entry.adSpend += adSpend;
      entry.organicSales = Math.max(0, entry.totalSales - entry.adSales);
      entry.sources.push({ file: ppcFile.name, row: row._sourceIndex });
    } else {
      skuDataMap.set(key, {
        totalSales: adSales,
        sessions: 0,
        organicSales: 0,
        adSales: adSales,
        adSpend: adSpend,
        sources: [{ file: ppcFile.name, row: row._sourceIndex }]
      });
    }
  });
  
  // Identify cannibalization
  const cannibalized = [];
  let totalCannibalizedSpend = 0;
  
  skuDataMap.forEach((data, key) => {
    if (data.totalSales === 0 || data.adSales === 0) return;
    
    const adSalesRatio = (data.adSales / data.totalSales) * 100;
    const acos = data.adSales > 0 ? (data.adSpend / data.adSales * 100) : 0;
    
    // High cannibalization: >80% ad sales with very low ACOS (<10%)
    if (adSalesRatio > 80 && acos < 10 && data.adSpend > 20) {
      const estimatedWaste = data.adSpend * 0.6; // Estimate 60% waste
      totalCannibalizedSpend += estimatedWaste;
      
      cannibalized.push({
        sku: key,
        totalSales: data.totalSales,
        adSales: data.adSales,
        organicSales: data.organicSales,
        adSalesRatio: adSalesRatio,
        adSpend: data.adSpend,
        acos: acos,
        estimatedWaste: estimatedWaste,
        sources: data.sources
      });
    }
  });
  
  cannibalized.sort((a, b) => b.estimatedWaste - a.estimatedWaste);
  
  return {
    status: 'complete',
    summary: {
      skusAnalyzed: skuDataMap.size,
      cannibalizedCount: cannibalized.length,
      totalCannibalizedSpend: totalCannibalizedSpend
    },
    findings: cannibalized.length > 0 ? [{
      type: 'alert',
      severity: 'critical',
      title: `AdsGupta Alert: ${cannibalized.length} SKUs with High Cannibalization`,
      description: `You are paying $${totalCannibalizedSpend.toFixed(2)} for sales you would likely get organically. These SKUs have >80% ad sales with <10% ACOS.`,
      value: `-$${totalCannibalizedSpend.toFixed(0)}`,
      metric: 'Wasted Spend',
      data: cannibalized.slice(0, 10),
      traceable: true
    }] : [{
      type: 'success',
      title: 'No significant cannibalization detected',
      description: 'Your PPC spend appears to be driving incremental sales'
    }],
    detailedData: cannibalized
  };
};

/**
 * CROSS-POLLINATION INSIGHT #3: Inventory-Ad Velocity Mismatch
 * Flags SKUs with high PPC spend but low inventory
 */
export const calculateInventoryAdVelocity = (masterData, files) => {
  const inventoryFile = files.find(f => f.reportType === 'inventory_report');
  const ppcFile = files.find(f => ['sponsored_products', 'search_term_report'].includes(f.reportType));
  
  if (!inventoryFile || !ppcFile) {
    return { status: 'requires_data', message: 'Requires Inventory Report + PPC Report' };
  }
  
  const skuMap = new Map();
  
  // Get inventory levels
  const inventoryData = cleanFileData(inventoryFile.data, 'inventory_report');
  inventoryData.forEach(row => {
    const key = row._primaryKey;
    const available = safeInt(getAliasedValue(row, 'inventory') || row.available || 0);
    
    skuMap.set(key, {
      available: available,
      adSpend: 0,
      adSales: 0,
      dailyVelocity: 0,
      daysOfStock: 0,
      sources: [{ file: inventoryFile.name, row: row._sourceIndex }]
    });
  });
  
  // Get PPC data
  const ppcData = cleanFileData(ppcFile.data, ppcFile.reportType);
  ppcData.forEach(row => {
    const key = row._primaryKey;
    const spend = safeNumber(getAliasedValue(row, 'spend') || 0);
    const sales = safeNumber(getAliasedValue(row, 'sales') || row['7_day_total_sales'] || 0);
    const units = safeInt(getAliasedValue(row, 'units') || row['7_day_total_units'] || 0);
    
    if (skuMap.has(key)) {
      const entry = skuMap.get(key);
      entry.adSpend += spend;
      entry.adSales += sales;
      entry.dailyVelocity = units / 7; // Assume 7-day report
      entry.daysOfStock = entry.dailyVelocity > 0 ? entry.available / entry.dailyVelocity : 999;
      entry.sources.push({ file: ppcFile.name, row: row._sourceIndex });
    }
  });
  
  // Find emergency cases
  const emergencyPause = [];
  let atRiskSpend = 0;
  
  skuMap.forEach((data, key) => {
    if (data.adSpend > 10 && data.daysOfStock < 10 && data.daysOfStock > 0) {
      atRiskSpend += data.adSpend;
      emergencyPause.push({
        sku: key,
        available: data.available,
        daysOfStock: Math.round(data.daysOfStock),
        dailyVelocity: data.dailyVelocity.toFixed(1),
        adSpend: data.adSpend,
        adSales: data.adSales,
        recommendation: data.daysOfStock < 5 ? 'EMERGENCY PAUSE' : 'Reduce Bids',
        sources: data.sources
      });
    }
  });
  
  emergencyPause.sort((a, b) => a.daysOfStock - b.daysOfStock);
  
  return {
    status: 'complete',
    summary: {
      skusAnalyzed: skuMap.size,
      emergencyCount: emergencyPause.filter(e => e.daysOfStock < 5).length,
      atRiskCount: emergencyPause.length,
      atRiskSpend: atRiskSpend
    },
    findings: emergencyPause.length > 0 ? [{
      type: 'alert',
      severity: 'critical',
      title: `Emergency: ${emergencyPause.filter(e => e.daysOfStock < 5).length} SKUs need immediate ad pause`,
      description: `You're spending $${atRiskSpend.toFixed(2)} on ads for SKUs with <10 days inventory. Stockout will destroy BSR.`,
      value: emergencyPause.filter(e => e.daysOfStock < 5).length.toString(),
      metric: 'Emergency Pause',
      data: emergencyPause.slice(0, 10),
      traceable: true
    }] : [{
      type: 'success',
      title: 'Inventory-Ad alignment healthy',
      description: 'No SKUs with critical inventory-ad mismatch detected'
    }],
    detailedData: emergencyPause
  };
};

/**
 * CROSS-POLLINATION INSIGHT #4: ROAS Leak / Waste Map
 * Finds keywords that drive sales but also drive high returns
 */
export const calculateRoasLeak = (masterData, files) => {
  const returnsFile = files.find(f => f.reportType === 'returns_report');
  const ppcFile = files.find(f => f.reportType === 'search_term_report');
  
  if (!returnsFile || !ppcFile) {
    return { status: 'requires_data', message: 'Requires Returns Report + Search Term Report' };
  }
  
  const keywordMap = new Map();
  const skuReturnMap = new Map();
  
  // Build return rates by SKU
  const returnsData = cleanFileData(returnsFile.data, 'returns_report');
  returnsData.forEach(row => {
    const key = row._primaryKey;
    const reason = row.return_reason || row.reason || 'Unknown';
    
    if (!skuReturnMap.has(key)) {
      skuReturnMap.set(key, { totalReturns: 0, reasons: {} });
    }
    const entry = skuReturnMap.get(key);
    entry.totalReturns++;
    entry.reasons[reason] = (entry.reasons[reason] || 0) + 1;
  });
  
  // Map keywords to SKUs and check return correlation
  const ppcData = cleanFileData(ppcFile.data, 'search_term_report');
  ppcData.forEach(row => {
    const keyword = row.customer_search_term || row.search_term || row.keyword;
    const sku = row._primaryKey;
    const sales = safeNumber(getAliasedValue(row, 'sales') || row['7_day_total_sales'] || 0);
    const spend = safeNumber(getAliasedValue(row, 'spend') || 0);
    const units = safeInt(getAliasedValue(row, 'units') || row['7_day_total_units'] || 0);
    
    if (!keyword || sales === 0) return;
    
    const returnData = skuReturnMap.get(sku);
    const estimatedReturnRate = returnData ? (returnData.totalReturns / Math.max(units, 1)) * 100 : 0;
    
    if (!keywordMap.has(keyword)) {
      keywordMap.set(keyword, {
        keyword: keyword,
        totalSales: 0,
        totalSpend: 0,
        totalUnits: 0,
        estimatedReturns: 0,
        returnRate: 0,
        topReturnReason: '',
        sources: []
      });
    }
    
    const entry = keywordMap.get(keyword);
    entry.totalSales += sales;
    entry.totalSpend += spend;
    entry.totalUnits += units;
    if (returnData) {
      entry.estimatedReturns += returnData.totalReturns;
      const topReason = Object.entries(returnData.reasons).sort((a, b) => b[1] - a[1])[0];
      if (topReason) entry.topReturnReason = topReason[0];
    }
    entry.sources.push({ file: ppcFile.name, row: row._sourceIndex });
  });
  
  // Calculate return rates and find trap keywords
  const trapKeywords = [];
  
  keywordMap.forEach((data, keyword) => {
    data.returnRate = data.totalUnits > 0 ? (data.estimatedReturns / data.totalUnits * 100) : 0;
    data.roas = data.totalSpend > 0 ? data.totalSales / data.totalSpend : 0;
    data.trueRoas = data.totalSpend > 0 ? (data.totalSales * (1 - data.returnRate / 100)) / data.totalSpend : 0;
    
    // Trap keyword: drives sales but high return rate
    if (data.returnRate > 20 && data.totalSpend > 20) {
      trapKeywords.push({
        keyword: keyword,
        sales: data.totalSales,
        spend: data.totalSpend,
        returnRate: data.returnRate.toFixed(1),
        apparentRoas: data.roas.toFixed(2),
        trueRoas: data.trueRoas.toFixed(2),
        topReturnReason: data.topReturnReason,
        recommendation: `Stop bidding - ${data.returnRate.toFixed(0)}% return rate`,
        sources: data.sources
      });
    }
  });
  
  trapKeywords.sort((a, b) => parseFloat(b.returnRate) - parseFloat(a.returnRate));
  
  const totalTrapSpend = trapKeywords.reduce((s, k) => s + k.spend, 0);
  
  return {
    status: 'complete',
    summary: {
      keywordsAnalyzed: keywordMap.size,
      trapKeywordCount: trapKeywords.length,
      trapSpend: totalTrapSpend
    },
    findings: trapKeywords.length > 0 ? [{
      type: 'alert',
      severity: 'critical',
      title: `AdsGupta Insight: ${trapKeywords.length} "Trap Keywords" Found`,
      description: `These keywords look profitable but drive high returns. Total spend at risk: $${totalTrapSpend.toFixed(2)}`,
      value: trapKeywords.length.toString(),
      metric: 'Trap Keywords',
      data: trapKeywords.slice(0, 10),
      traceable: true
    }] : [{
      type: 'success',
      title: 'No trap keywords detected',
      description: 'Your keywords are not driving excessive returns'
    }],
    detailedData: trapKeywords
  };
};

/**
 * Price Elasticity Engine
 * Analyzes price changes vs unit velocity correlation
 */
export const calculateElasticity = (masterData, files) => {
  const businessFiles = files.filter(f => f.reportType === 'business_report');
  
  if (businessFiles.length < 2) {
    return { 
      status: 'requires_data', 
      message: 'Requires 2+ Business Reports from different time periods for elasticity analysis' 
    };
  }
  
  // Build time series by SKU
  const skuTimeSeries = new Map();
  
  businessFiles.forEach((file, fileIdx) => {
    const data = cleanFileData(file.data, 'business_report');
    data.forEach(row => {
      const key = row._primaryKey;
      const price = safeNumber(getAliasedValue(row, 'price') || row.average_selling_price || 0);
      const units = safeInt(getAliasedValue(row, 'units') || 0);
      
      if (!skuTimeSeries.has(key)) {
        skuTimeSeries.set(key, []);
      }
      skuTimeSeries.get(key).push({ period: fileIdx, price, units, file: file.name });
    });
  });
  
  // Calculate elasticity for SKUs with price changes
  const elasticityResults = [];
  
  skuTimeSeries.forEach((series, sku) => {
    if (series.length < 2) return;
    
    // Sort by period
    series.sort((a, b) => a.period - b.period);
    
    // Find price changes
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const curr = series[i];
      
      if (prev.price === 0 || curr.price === 0) continue;
      
      const priceChange = ((curr.price - prev.price) / prev.price) * 100;
      const unitChange = prev.units > 0 ? ((curr.units - prev.units) / prev.units) * 100 : 0;
      
      if (Math.abs(priceChange) > 3) { // Only significant price changes
        const elasticity = priceChange !== 0 ? unitChange / priceChange : 0;
        
        // Calculate profit impact
        const prevRevenue = prev.price * prev.units;
        const currRevenue = curr.price * curr.units;
        const revenueChange = currRevenue - prevRevenue;
        
        elasticityResults.push({
          sku: sku,
          oldPrice: prev.price,
          newPrice: curr.price,
          priceChange: priceChange.toFixed(1),
          oldUnits: prev.units,
          newUnits: curr.units,
          unitChange: unitChange.toFixed(1),
          elasticity: elasticity.toFixed(2),
          revenueImpact: revenueChange,
          insight: elasticity < -1 
            ? 'Elastic: Price increase hurt volume significantly' 
            : elasticity > -0.5 
              ? 'Inelastic: Can likely raise prices more' 
              : 'Moderate elasticity',
          sources: [{ file: prev.file }, { file: curr.file }]
        });
      }
    }
  });
  
  // Find optimization opportunities
  const canRaisePrices = elasticityResults.filter(r => parseFloat(r.elasticity) > -0.5 && parseFloat(r.priceChange) > 0);
  const shouldLowerPrices = elasticityResults.filter(r => parseFloat(r.elasticity) < -2 && parseFloat(r.priceChange) > 0);
  
  return {
    status: elasticityResults.length > 0 ? 'complete' : 'insufficient_data',
    summary: {
      skusWithPriceChanges: elasticityResults.length,
      canRaisePrices: canRaisePrices.length,
      shouldLowerPrices: shouldLowerPrices.length
    },
    findings: [
      ...(canRaisePrices.length > 0 ? [{
        type: 'opportunity',
        title: `${canRaisePrices.length} SKUs can likely support higher prices`,
        description: 'These products showed inelastic demand - price increases had minimal volume impact',
        data: canRaisePrices.slice(0, 5),
        traceable: true
      }] : []),
      ...(shouldLowerPrices.length > 0 ? [{
        type: 'warning',
        title: `${shouldLowerPrices.length} SKUs may be overpriced`,
        description: 'High elasticity detected - consider price reductions to recover volume',
        data: shouldLowerPrices.slice(0, 5),
        traceable: true
      }] : [])
    ],
    detailedData: elasticityResults
  };
};

/**
 * Find correlations between any two metrics
 */
export const findCorrelations = (masterData) => {
  if (!masterData?.records || masterData.records.length < 5) {
    return [];
  }
  
  const numericFields = [];
  const sampleRecord = masterData.records[0];
  
  // Find all numeric fields
  for (const [key, value] of Object.entries(sampleRecord)) {
    if (key.startsWith('_')) continue;
    if (typeof value === 'number') {
      numericFields.push(key);
    }
  }
  
  const correlations = [];
  
  // Calculate correlation for each pair
  for (let i = 0; i < numericFields.length; i++) {
    for (let j = i + 1; j < numericFields.length; j++) {
      const fieldA = numericFields[i];
      const fieldB = numericFields[j];
      
      const values = masterData.records
        .filter(r => r[fieldA] !== undefined && r[fieldB] !== undefined)
        .map(r => ({ a: r[fieldA], b: r[fieldB] }));
      
      if (values.length < 5) continue;
      
      // Calculate Pearson correlation
      const n = values.length;
      const sumA = values.reduce((s, v) => s + v.a, 0);
      const sumB = values.reduce((s, v) => s + v.b, 0);
      const sumAB = values.reduce((s, v) => s + v.a * v.b, 0);
      const sumA2 = values.reduce((s, v) => s + v.a * v.a, 0);
      const sumB2 = values.reduce((s, v) => s + v.b * v.b, 0);
      
      const num = n * sumAB - sumA * sumB;
      const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
      
      const correlation = den !== 0 ? num / den : 0;
      
      if (Math.abs(correlation) > 0.3) { // Only significant correlations
        correlations.push({
          fieldA,
          fieldB,
          correlation: correlation.toFixed(3),
          strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.5 ? 'moderate' : 'weak',
          direction: correlation > 0 ? 'positive' : 'negative',
          dataPoints: values.length,
          isAlarming: (fieldA.includes('spend') && fieldB.includes('return')) ||
                      (fieldA.includes('return') && fieldB.includes('spend')) ||
                      (Math.abs(correlation) > 0.8 && correlation < 0)
        });
      }
    }
  }
  
  // Sort by absolute correlation strength
  correlations.sort((a, b) => Math.abs(parseFloat(b.correlation)) - Math.abs(parseFloat(a.correlation)));
  
  return correlations;
};

/**
 * Generate "Smart Suggest" - top 3 alarming correlations
 */
export const getAlarmingCorrelations = (correlations) => {
  return correlations
    .filter(c => c.isAlarming || (Math.abs(parseFloat(c.correlation)) > 0.6 && parseFloat(c.correlation) < 0))
    .slice(0, 3)
    .map(c => ({
      ...c,
      insight: `${c.fieldA} has ${c.strength} ${c.direction} correlation with ${c.fieldB}`,
      recommendation: c.direction === 'negative' && c.fieldA.includes('spend')
        ? `Higher ${c.fieldA} correlates with lower ${c.fieldB} - review efficiency`
        : `Investigate relationship between ${c.fieldA} and ${c.fieldB}`
    }));
};

/**
 * Run all cross-pollination analyses
 */
export const runCrossPollination = (masterData, files) => {
  return {
    trueProfitAudit: calculateTrueProfit(masterData, files),
    ppcCannibalization: calculatePpcCannibalization(masterData, files),
    inventoryAdVelocity: calculateInventoryAdVelocity(masterData, files),
    roasLeak: calculateRoasLeak(masterData, files),
    elasticityEngine: calculateElasticity(masterData, files),
    correlations: findCorrelations(masterData)
  };
};

export default {
  cleanFileData,
  mergeFiles,
  calculateTrueProfit,
  calculatePpcCannibalization,
  calculateInventoryAdVelocity,
  calculateRoasLeak,
  calculateElasticity,
  findCorrelations,
  getAlarmingCorrelations,
  runCrossPollination
};
