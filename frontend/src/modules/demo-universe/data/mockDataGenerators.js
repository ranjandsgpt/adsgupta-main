/**
 * Demo Universe - Mock Data Generators
 * Generates 1,400+ data points for demonstration purposes
 */

// Generate mock data for time series (90 days × 15+ metrics = 1,350+ data points)
export const generateMockData = (marketplace, days = 90) => {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);

  const marketplaceMultipliers = {
    amazon: { sales: 1, traffic: 1, conversion: 1 },
    walmart: { sales: 0.7, traffic: 0.65, conversion: 0.85 },
    target: { sales: 0.5, traffic: 0.45, conversion: 0.9 },
    quickcommerce: { sales: 0.3, traffic: 0.8, conversion: 1.2 }
  };

  const mult = marketplaceMultipliers[marketplace] || marketplaceMultipliers.amazon;

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const seasonality = 1 + Math.sin((i / 30) * Math.PI) * 0.15;
    
    // Organic metrics
    const organicSales = Math.round((8000 + Math.random() * 4000) * mult.sales * seasonality * (isWeekend ? 1.2 : 1));
    const organicSessions = Math.round((5000 + Math.random() * 2000) * mult.traffic * seasonality);
    const organicUnits = Math.round(organicSales / (25 + Math.random() * 10));
    const organicConversion = ((organicUnits / organicSessions) * 100 * mult.conversion).toFixed(2);

    // Paid metrics
    const adSpend = Math.round((1500 + Math.random() * 1000) * mult.sales);
    const paidSales = Math.round(adSpend * (3 + Math.random() * 2));
    const paidSessions = Math.round((2000 + Math.random() * 1500) * mult.traffic);
    const paidUnits = Math.round(paidSales / (28 + Math.random() * 8));
    const paidConversion = ((paidUnits / paidSessions) * 100 * mult.conversion).toFixed(2);

    // Additional metrics
    const buyBoxPct = (85 + Math.random() * 12).toFixed(1);
    const competitorPrice = (24.99 + Math.random() * 5).toFixed(2);
    const ourPrice = (competitorPrice * (0.95 + Math.random() * 0.1)).toFixed(2);
    const returnRate = (2 + Math.random() * 3).toFixed(2);

    // Region breakdown
    const regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
    const regionData = {};
    regions.forEach(region => {
      regionData[region] = {
        sales: Math.round(organicSales * (0.15 + Math.random() * 0.1)),
        returnRate: (1.5 + Math.random() * 4).toFixed(2)
      };
    });

    data.push({
      date: date.toISOString().split('T')[0],
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      // Sales
      organicSales,
      paidSales,
      totalSales: organicSales + paidSales,
      // Sessions
      organicSessions,
      paidSessions,
      totalSessions: organicSessions + paidSessions,
      // Units
      organicUnits,
      paidUnits,
      totalUnits: organicUnits + paidUnits,
      // Conversion
      organicConversion: parseFloat(organicConversion),
      paidConversion: parseFloat(paidConversion),
      avgConversion: parseFloat(((parseFloat(organicConversion) + parseFloat(paidConversion)) / 2).toFixed(2)),
      // PPC
      adSpend,
      acos: ((adSpend / paidSales) * 100).toFixed(1),
      roas: (paidSales / adSpend).toFixed(2),
      tacos: ((adSpend / (organicSales + paidSales)) * 100).toFixed(1),
      // Competition
      buyBoxPct: parseFloat(buyBoxPct),
      competitorPrice: parseFloat(competitorPrice),
      ourPrice: parseFloat(ourPrice),
      // Returns
      returnRate: parseFloat(returnRate),
      returnUnits: Math.round(organicUnits * parseFloat(returnRate) / 100),
      // Forecasts (30 days ahead simulation)
      forecastSales: Math.round((organicSales + paidSales) * (1 + (Math.random() * 0.2 - 0.05))),
      forecastConversion: parseFloat((parseFloat(organicConversion) * (1 + Math.random() * 0.1)).toFixed(2)),
      // Region
      ...regionData,
      isWeekend,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekday]
    });
  }

  return data;
};

// SKU data for product-level analysis (50 SKUs × 15 metrics = 750 data points)
export const generateSKUData = (marketplace) => {
  const colors = ['Red', 'Blue', 'Black', 'White', 'Green'];
  const categories = ['Electronics', 'Home & Kitchen', 'Beauty', 'Sports', 'Toys'];
  const skus = [];

  for (let i = 0; i < 50; i++) {
    const color = colors[i % colors.length];
    const category = categories[Math.floor(i / 10)];
    skus.push({
      sku: `SKU-${String(i + 1).padStart(4, '0')}`,
      asin: `B0${String(Math.random()).slice(2, 10).toUpperCase()}`,
      name: `Product ${i + 1} - ${color}`,
      color,
      category,
      price: (19.99 + Math.random() * 80).toFixed(2),
      cost: (8 + Math.random() * 30).toFixed(2),
      stock: Math.floor(Math.random() * 500),
      sales: Math.floor(Math.random() * 10000 + 1000),
      units: Math.floor(Math.random() * 500 + 50),
      sessions: Math.floor(Math.random() * 5000 + 500),
      conversion: (Math.random() * 15 + 5).toFixed(2),
      buyBox: (Math.random() * 30 + 70).toFixed(1),
      adSpend: Math.floor(Math.random() * 2000 + 200),
      acos: (Math.random() * 30 + 10).toFixed(1),
      roi: (Math.random() * 200 + 50).toFixed(1),
      region: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
      marketplace
    });
  }

  return skus;
};

// Generate AI Agent mock findings
export const generateMockAgentFindings = (agentId) => {
  const findings = {
    'negative-ninja': [
      { type: 'alert', severity: 'critical', title: '47 search terms wasting $2,840/month', description: 'High-spend keywords with 0% conversion' },
      { type: 'opportunity', title: '23 new negative keywords identified', description: 'Adding these could save $1,200/month' }
    ],
    'acos-optimizer': [
      { type: 'alert', severity: 'high', title: '12 campaigns above 35% ACOS target', description: 'Consider bid adjustments' },
      { type: 'success', title: '8 campaigns achieving sub-20% ACOS', description: 'Top performers to scale' }
    ],
    'dayparting-pro': [
      { type: 'opportunity', title: 'Peak conversion: 7-9 PM EST', description: '23% higher conversion during evening hours' },
      { type: 'warning', title: 'Low performance: 2-5 AM', description: 'Consider reducing bids during off-peak' }
    ],
    'buy-box-analyzer': [
      { type: 'alert', severity: 'medium', title: '3 ASINs lost Buy Box this week', description: 'Competitor price undercuts detected' },
      { type: 'success', title: 'Buy Box win rate: 94%', description: 'Above category average of 87%' }
    ],
    'conversion-analyzer': [
      { type: 'alert', severity: 'high', title: '5 ASINs below 5% conversion', description: 'Review listings for optimization' },
      { type: 'opportunity', title: 'A+ Content opportunity on 8 ASINs', description: 'Could improve conversion by 15%' }
    ]
  };
  
  return findings[agentId] || [{ type: 'info', title: 'Analysis pending', description: 'Connect SP-API for real-time insights' }];
};

// Generate demo summary stats
export const generateDemoSummary = (marketplace) => {
  const mult = marketplace === 'amazon' ? 1 : marketplace === 'walmart' ? 0.7 : 0.5;
  
  return {
    totalSales: Math.round(850000 * mult),
    totalUnits: Math.round(32000 * mult),
    avgConversion: (12.4 * mult).toFixed(1),
    buyBoxWinRate: (94.2 - Math.random() * 5).toFixed(1),
    adSpend: Math.round(125000 * mult),
    avgAcos: (18.5 + Math.random() * 5).toFixed(1),
    roas: (4.2 + Math.random()).toFixed(2),
    skuCount: 50,
    activeCampaigns: Math.round(45 * mult)
  };
};

export default {
  generateMockData,
  generateSKUData,
  generateMockAgentFindings,
  generateDemoSummary
};
