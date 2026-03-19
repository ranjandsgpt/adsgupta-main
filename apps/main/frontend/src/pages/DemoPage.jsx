import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Eye, Target, Package,
  BarChart3, Percent, RefreshCw, Filter, Calendar, ChevronDown, Zap,
  Globe, Truck, Clock, Award, AlertTriangle, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import { AIAgentSidebar } from '../components/AIAgentSidebar';

// Generate mock data for 1,400+ data points
const generateMockData = (marketplace, days = 90) => {
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

// SKU data for product-level analysis
const generateSKUData = (marketplace) => {
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

// Marketplace Tabs
const MarketplaceTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'amazon', label: 'Amazon', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'walmart', label: 'Walmart', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'target', label: 'Target', color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 'quickcommerce', label: 'Quick-Commerce', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id 
              ? `${tab.bg} ${tab.color}` 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Toggle Switch for Organic vs Paid
const MetricToggle = ({ options, value, onChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            value === opt.value 
              ? 'bg-blue-500 text-white' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// KPI Card
const KPICard = ({ label, value, change, prefix = '', suffix = '', icon: Icon, color, trend }) => {
  const isPositive = change > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[#0A1628] border border-white/5 hover:border-white/10 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} className={color} />}
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-bold font-['JetBrains_Mono'] ${color}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="p-3 rounded-xl bg-[#0A1628] border border-white/10 shadow-xl">
      <p className="text-zinc-400 text-xs mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-400">{entry.name}:</span>
          <span className="text-white font-semibold font-['JetBrains_Mono']">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Main Demo Page
const DemoPage = () => {
  const [marketplace, setMarketplace] = useState('amazon');
  const [viewMode, setViewMode] = useState('all'); // all, organic, paid
  const [dateRange, setDateRange] = useState('30d');
  const [showAgentSidebar, setShowAgentSidebar] = useState(false);
  
  // Generate data based on marketplace
  const data = useMemo(() => generateMockData(marketplace, dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90), [marketplace, dateRange]);
  const skuData = useMemo(() => generateSKUData(marketplace), [marketplace]);

  // Calculate summary KPIs
  const kpis = useMemo(() => {
    const totalSales = data.reduce((sum, d) => sum + d.totalSales, 0);
    const totalSessions = data.reduce((sum, d) => sum + d.totalSessions, 0);
    const totalUnits = data.reduce((sum, d) => sum + d.totalUnits, 0);
    const totalAdSpend = data.reduce((sum, d) => sum + d.adSpend, 0);
    const avgConversion = (data.reduce((sum, d) => sum + d.avgConversion, 0) / data.length).toFixed(2);
    const avgBuyBox = (data.reduce((sum, d) => sum + d.buyBoxPct, 0) / data.length).toFixed(1);
    const avgAcos = (data.reduce((sum, d) => sum + parseFloat(d.acos), 0) / data.length).toFixed(1);
    const avgRoas = (data.reduce((sum, d) => sum + parseFloat(d.roas), 0) / data.length).toFixed(2);

    return {
      totalSales, totalSessions, totalUnits, totalAdSpend,
      avgConversion, avgBuyBox, avgAcos, avgRoas
    };
  }, [data]);

  // Filter data for charts based on viewMode
  const chartData = useMemo(() => {
    return data.slice(-30).map(d => ({
      ...d,
      sales: viewMode === 'organic' ? d.organicSales : viewMode === 'paid' ? d.paidSales : d.totalSales,
      sessions: viewMode === 'organic' ? d.organicSessions : viewMode === 'paid' ? d.paidSessions : d.totalSessions,
      conversion: viewMode === 'organic' ? d.organicConversion : viewMode === 'paid' ? d.paidConversion : d.avgConversion,
    }));
  }, [data, viewMode]);

  // Add forecast data (dotted line)
  const chartDataWithForecast = useMemo(() => {
    const lastValue = chartData[chartData.length - 1]?.sales || 0;
    const forecast = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        forecastSales: Math.round(lastValue * (1 + Math.sin(i / 10) * 0.1 + Math.random() * 0.05)),
        isForecast: true
      });
    }
    return [...chartData, ...forecast];
  }, [chartData]);

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />

      <main className="relative pt-28 pb-24">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white font-['Manrope'] tracking-tight mb-2">
                Demo Universe
              </h1>
              <p className="text-zinc-400">
                Explore 1,400+ data points across marketplaces
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <MarketplaceTabs active={marketplace} onChange={setMarketplace} />
              
              <MetricToggle
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Organic', value: 'organic' },
                  { label: 'Paid', value: 'paid' }
                ]}
                value={viewMode}
                onChange={setViewMode}
              />

              <button
                onClick={() => setShowAgentSidebar(!showAgentSidebar)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                <Zap size={16} />
                AI Agents
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <KPICard label="Total Sales" value={kpis.totalSales} prefix="$" change={12.5} icon={DollarSign} color="text-emerald-400" />
            <KPICard label="Sessions" value={kpis.totalSessions} change={8.3} icon={Eye} color="text-blue-400" />
            <KPICard label="Conversion" value={kpis.avgConversion} suffix="%" change={-2.1} icon={Target} color="text-violet-400" />
            <KPICard label="Units Sold" value={kpis.totalUnits} change={15.2} icon={Package} color="text-cyan-400" />
            <KPICard label="Ad Spend" value={kpis.totalAdSpend} prefix="$" change={5.8} icon={BarChart3} color="text-rose-400" />
            <KPICard label="ACOS" value={kpis.avgAcos} suffix="%" change={-3.2} icon={Percent} color="text-amber-400" />
            <KPICard label="ROAS" value={kpis.avgRoas} suffix="x" change={7.1} icon={TrendingUp} color="text-emerald-400" />
            <KPICard label="Buy Box" value={kpis.avgBuyBox} suffix="%" change={1.5} icon={Award} color="text-orange-400" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart with Forecast */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Sales Trend + 30-Day Forecast</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-blue-400">
                    <div className="w-3 h-0.5 bg-blue-400" /> Actual
                  </span>
                  <span className="flex items-center gap-1 text-blue-400/50">
                    <div className="w-3 h-0.5 bg-blue-400/50 border-dashed border-b" /> Forecast
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartDataWithForecast}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="dateFormatted" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#salesGradient)" 
                    name="Sales"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecastSales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none" 
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Chart */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="dateFormatted" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="organicConversion" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                    name="Organic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="paidConversion" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={false}
                    name="Paid"
                  />
                  <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Target', fill: '#EF4444', fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Buy Box vs Price Chart */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Buy Box % vs Competitor Price</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="dateFormatted" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="buyBoxPct" fill="#F59E0B" name="Buy Box %" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="competitorPrice" stroke="#EF4444" strokeWidth={2} dot={false} name="Competitor" />
                  <Line yAxisId="right" type="monotone" dataKey="ourPrice" stroke="#10B981" strokeWidth={2} dot={false} name="Our Price" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Return Rate by Region */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Return Rate by Region</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { region: 'Northeast', returnRate: 3.2, sales: 45000 },
                  { region: 'Southeast', returnRate: 2.8, sales: 38000 },
                  { region: 'Midwest', returnRate: 4.1, sales: 32000 },
                  { region: 'Southwest', returnRate: 2.5, sales: 28000 },
                  { region: 'West', returnRate: 3.8, sales: 52000 }
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                  <XAxis type="number" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="region" stroke="#52525B" fontSize={10} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="returnRate" fill="#EF4444" name="Return Rate %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Top Products by ROI</h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                  <option>All Colors</option>
                  <option>Red</option>
                  <option>Blue</option>
                  <option>Black</option>
                </select>
                <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                  <option>All Regions</option>
                  <option>New York</option>
                  <option>Los Angeles</option>
                  <option>Chicago</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Color</th>
                    <th className="text-right py-3 px-4">Sales</th>
                    <th className="text-right py-3 px-4">Conv %</th>
                    <th className="text-right py-3 px-4">ACOS</th>
                    <th className="text-right py-3 px-4">ROI</th>
                    <th className="text-right py-3 px-4">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {skuData.slice(0, 10).map((sku, index) => (
                    <tr key={sku.sku} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-['JetBrains_Mono'] text-sm text-zinc-400">{sku.sku}</td>
                      <td className="py-3 px-4 text-white text-sm">{sku.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${sku.color === 'Red' ? 'bg-red-500/20 text-red-400' :
                            sku.color === 'Blue' ? 'bg-blue-500/20 text-blue-400' :
                            sku.color === 'Black' ? 'bg-zinc-500/20 text-zinc-400' :
                            sku.color === 'White' ? 'bg-white/20 text-white' :
                            'bg-emerald-500/20 text-emerald-400'}`}>
                          {sku.color}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-['JetBrains_Mono'] text-sm text-emerald-400">
                        ${Number(sku.sales).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-['JetBrains_Mono'] text-sm text-blue-400">
                        {sku.conversion}%
                      </td>
                      <td className="py-3 px-4 text-right font-['JetBrains_Mono'] text-sm text-amber-400">
                        {sku.acos}%
                      </td>
                      <td className="py-3 px-4 text-right font-['JetBrains_Mono'] text-sm text-violet-400">
                        {sku.roi}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-['JetBrains_Mono'] text-sm ${
                          sku.stock < 50 ? 'text-red-400' : sku.stock < 100 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {sku.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* AI Agent Sidebar */}
      <AnimatePresence>
        {showAgentSidebar && (
          <AIAgentSidebar onClose={() => setShowAgentSidebar(false)} data={data} skuData={skuData} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default DemoPage;
