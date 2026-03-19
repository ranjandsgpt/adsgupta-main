/**
 * Demo Universe Page - Internal Demo for AdsGupta
 * Route: /internal-demo (tools domain) or /amazon-audit (demo domain)
 * This page showcases the full capabilities with mock data
 * Isolated from production data via separate store
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Eye, Target, Package,
  BarChart3, Percent, RefreshCw, Filter, Calendar, ChevronDown, Zap,
  Globe, Truck, Clock, Award, AlertTriangle, CheckCircle2, ArrowUpRight,
  ArrowLeft, Lock, Sparkles, Upload, ExternalLink
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { AIAgentSidebar } from '@/components/AIAgentSidebar';
import useDemoStore from './store/demoStore';
import { generateMockData, generateSKUData, generateDemoSummary } from './data/mockDataGenerators';

// Domain config
const TOOLS_DOMAIN = process.env.REACT_APP_TOOLS_DOMAIN || 'https://tools.adsgupta.com';

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

// Toggle Switch
const MetricToggle = ({ options, value, onChange }) => (
  <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === opt.value ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// KPI Card
const KPICard = ({ label, value, change, prefix = '', suffix = '', icon: Icon, color, trend }) => {
  const isPositive = change > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[#0A1628] border border-white/5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} className={color} />}
      </div>
      <p className={`text-2xl font-bold font-['JetBrains_Mono'] ${color}`}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-zinc-600 text-xs">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl bg-[#0A1628] border border-white/10 shadow-xl">
      <p className="text-zinc-400 text-xs mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
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

// Demo Universe Page
const DemoUniversePage = () => {
  const navigate = useNavigate();
  const [showAgentSidebar, setShowAgentSidebar] = useState(false);
  
  const { 
    marketplace, setMarketplace,
    dataMode, setDataMode,
    initializeData
  } = useDemoStore();

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Generate data based on marketplace
  const data = useMemo(() => generateMockData(marketplace, 90), [marketplace]);
  const skuData = useMemo(() => generateSKUData(marketplace), [marketplace]);
  const summary = useMemo(() => generateDemoSummary(marketplace), [marketplace]);

  // Recent data for charts (last 30 days)
  const recentData = useMemo(() => data.slice(-30), [data]);

  // Forecast data
  const forecastData = useMemo(() => {
    const last = data.slice(-7);
    const forecast = [];
    for (let i = 1; i <= 30; i++) {
      const base = last[last.length - 1];
      forecast.push({
        dateFormatted: `Day +${i}`,
        isForecast: true,
        totalSales: Math.round(base.totalSales * (1 + (Math.random() * 0.1 - 0.02))),
        avgConversion: (base.avgConversion * (1 + Math.random() * 0.05)).toFixed(2)
      });
    }
    return [...last, ...forecast];
  }, [data]);

  // Top products
  const topProducts = useMemo(() => {
    return [...skuData]
      .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
      .slice(0, 10);
  }, [skuData]);

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />

      {/* AI Agent Sidebar - conditionally rendered */}
      <AnimatePresence>
        {showAgentSidebar && (
          <AIAgentSidebar 
            onClose={() => setShowAgentSidebar(false)}
            isDemo={true}
          />
        )}
      </AnimatePresence>

      <main className="relative pt-28 pb-24">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Demo Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 border border-violet-500/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Demo Universe</h3>
                  <p className="text-zinc-400 text-sm">Exploring with 1,400+ simulated data points • 15-Year Optimizer Logic</p>
                </div>
              </div>
              <a
                href={`${TOOLS_DOMAIN}/audit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-all group whitespace-nowrap"
                data-testid="analyze-your-data-link"
              >
                <Upload size={14} />
                Analyze Your Own Data
                <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </motion.div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white font-['Manrope'] tracking-tight mb-2">
                AI Command Center
              </h1>
              <p className="text-zinc-400">
                Multi-marketplace analytics • <span className="text-blue-400">{data.length * 15}+</span> data points
              </p>
            </div>

            <div className="flex items-center gap-4">
              <MarketplaceTabs active={marketplace} onChange={setMarketplace} />
              <MetricToggle
                options={[
                  { value: 'total', label: 'Total' },
                  { value: 'organic', label: 'Organic' },
                  { value: 'paid', label: 'Paid' }
                ]}
                value={dataMode}
                onChange={setDataMode}
              />
              <button
                onClick={() => setShowAgentSidebar(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all"
              >
                <Zap size={16} />
                20 AI Agents
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <KPICard label="Total Sales" value={summary.totalSales} prefix="$" change={12.4} icon={DollarSign} color="text-emerald-400" />
            <KPICard label="Units Sold" value={summary.totalUnits} change={8.2} icon={Package} color="text-cyan-400" />
            <KPICard label="Conversion" value={summary.avgConversion} suffix="%" change={2.1} icon={Target} color="text-violet-400" />
            <KPICard label="Buy Box" value={summary.buyBoxWinRate} suffix="%" change={1.5} icon={Award} color="text-amber-400" />
            <KPICard label="Ad Spend" value={summary.adSpend} prefix="$" change={-5.3} icon={BarChart3} color="text-rose-400" />
            <KPICard label="ACOS" value={summary.avgAcos} suffix="%" change={-3.2} icon={Percent} color="text-orange-400" />
            <KPICard label="ROAS" value={summary.roas} suffix="x" change={8.7} icon={TrendingUp} color="text-blue-400" />
            <KPICard label="SKUs" value={summary.skuCount} icon={ShoppingCart} color="text-pink-400" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend with Forecast */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Sales Trend + 30-Day Forecast</h3>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">Live + Predicted</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="dateFormatted" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="totalSales" fill="#3B82F620" stroke="#3B82F6" name="Sales" />
                  <Line 
                    type="monotone" 
                    dataKey="totalSales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray={(d) => d.isForecast ? "5 5" : "0"}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Rate */}
            <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
                <span className="text-zinc-500 text-xs">Organic vs Paid</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={recentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="dateFormatted" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="organicConversion" stroke="#10B981" strokeWidth={2} dot={false} name="Organic" />
                  <Line type="monotone" dataKey="paidConversion" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Paid" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Products by ROI</h3>
              <span className="text-zinc-500 text-xs">{topProducts.length} products</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Sales</th>
                    <th className="text-right py-3 px-4">Units</th>
                    <th className="text-right py-3 px-4">Conv %</th>
                    <th className="text-right py-3 px-4">ACOS</th>
                    <th className="text-right py-3 px-4">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, i) => (
                    <tr key={product.sku} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white text-sm font-mono">{product.sku}</td>
                      <td className="py-3 px-4 text-zinc-400 text-sm">{product.name}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono">${product.sales.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-cyan-400 font-mono">{product.units}</td>
                      <td className="py-3 px-4 text-right text-violet-400 font-mono">{product.conversion}%</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-mono">{product.acos}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold ${parseFloat(product.roi) > 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {product.roi}%
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

      <Footer />
    </div>
  );
};

export default DemoUniversePage;
