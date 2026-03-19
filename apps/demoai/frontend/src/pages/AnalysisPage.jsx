/**
 * Deep Analysis Page - Real data visualization from uploaded files
 * Zero hallucination - all metrics calculated from actual uploaded data
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Target, Eye, Package, BarChart3,
  Percent, AlertTriangle, CheckCircle2, Download, FileText, RefreshCw,
  ChevronRight, Zap, X, Bot, Search, Info, ArrowLeft, Loader2, Filter
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import useDataStore from '../store/dataStore';
import { 
  parseUploadedData, 
  runAllAgents, 
  formatCurrency, 
  formatPercent,
  exportFindingsToCSV 
} from '../utils/analysisEngineV2';

// Health Score Gauge
const HealthScoreGauge = ({ score }) => {
  const getColor = (s) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="#1E293B"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-['JetBrains_Mono']" style={{ color }}>{score}</span>
        <span className="text-zinc-500 text-xs">Health Score</span>
      </div>
    </div>
  );
};

// KPI Card
const KPICard = ({ label, value, prefix = '', suffix = '', icon: Icon, color, subtext }) => {
  const displayValue = value === 'N/A' || value === null || value === undefined 
    ? 'N/A' 
    : typeof value === 'number' 
      ? value.toLocaleString() 
      : value;

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
      <p className={`text-2xl font-bold font-['JetBrains_Mono'] ${displayValue === 'N/A' ? 'text-zinc-500' : color}`}>
        {displayValue !== 'N/A' && prefix}{displayValue}{displayValue !== 'N/A' && suffix}
      </p>
      {subtext && <p className="text-zinc-500 text-xs mt-1">{subtext}</p>}
    </motion.div>
  );
};

// Custom Tooltip
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

// Agent Finding Card
const FindingCard = ({ finding, agentName }) => {
  const severityColors = {
    critical: 'border-red-500/30 bg-red-500/5',
    high: 'border-orange-500/30 bg-orange-500/5',
    medium: 'border-amber-500/30 bg-amber-500/5',
    low: 'border-yellow-500/30 bg-yellow-500/5'
  };

  const typeColors = {
    alert: 'text-red-400',
    warning: 'text-amber-400',
    opportunity: 'text-emerald-400',
    success: 'text-green-400',
    info: 'text-blue-400'
  };

  const bgClass = finding.severity 
    ? severityColors[finding.severity] 
    : finding.type === 'alert' 
      ? severityColors.critical 
      : 'border-white/10 bg-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border ${bgClass}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${typeColors[finding.type] || 'text-zinc-400'}`}>
          {finding.type === 'alert' || finding.type === 'warning' ? (
            <AlertTriangle size={16} />
          ) : finding.type === 'success' || finding.type === 'opportunity' ? (
            <CheckCircle2 size={16} />
          ) : (
            <Info size={16} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium uppercase tracking-wider ${typeColors[finding.type]}`}>
              {finding.type === 'alert' ? (finding.severity || 'ALERT') : finding.type}
            </span>
            {agentName && (
              <span className="text-zinc-600 text-xs">• {agentName}</span>
            )}
          </div>
          <p className="text-white text-sm font-medium">{finding.title}</p>
          <p className="text-zinc-400 text-xs mt-1">{finding.description}</p>
          {finding.value && (
            <p className={`text-lg font-bold font-['JetBrains_Mono'] mt-2 ${
              finding.type === 'alert' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {finding.value}
            </p>
          )}
          {finding.requiresData && (
            <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
              <Info size={12} /> Upload required report type for this analysis
            </p>
          )}
          {finding.requiresApi && (
            <p className="text-blue-400 text-xs mt-2 flex items-center gap-1">
              <Zap size={12} /> Connect Amazon SP-API for real-time data
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Data Table Component
const DataTable = ({ data, columns, title }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  const sortedData = useMemo(() => {
    let filtered = data;
    if (filter) {
      filtered = data.filter(row => 
        Object.values(row).some(v => 
          String(v).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
    if (!sortKey) return filtered.slice(0, 20);
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    }).slice(0, 20);
  }, [data, sortKey, sortDir, filter]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 w-48"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`text-${col.align || 'left'} py-3 px-4 cursor-pointer hover:text-white transition-colors`}
                >
                  {col.label} {sortKey === col.key && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`py-3 px-4 text-${col.align || 'left'}`}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span className={`font-['JetBrains_Mono'] text-sm ${col.color || 'text-zinc-400'}`}>
                        {col.prefix}{row[col.key]?.toLocaleString?.() ?? row[col.key] ?? 'N/A'}{col.suffix}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sortedData.length === 0 && (
          <p className="text-center text-zinc-500 py-8">No data available</p>
        )}
      </div>
    </div>
  );
};

// Main Analysis Page
const AnalysisPage = () => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { uploadedData, fileName, parsedData, setParsedData, agentResults, setAgentResults, clearData } = useDataStore();

  // Parse data and run agents on mount
  useEffect(() => {
    if (uploadedData && !parsedData) {
      const parsed = parseUploadedData(uploadedData);
      setParsedData(parsed);
      
      // Run all AI agents
      const results = runAllAgents(parsed);
      setAgentResults(results);
    }
  }, [uploadedData, parsedData, setParsedData, setAgentResults]);

  // Redirect if no data
  useEffect(() => {
    if (!uploadedData) {
      navigate('/audit');
    }
  }, [uploadedData, navigate]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!parsedData?.asins) return { pareto: [], scatter: [] };

    // Pareto chart - top ASINs by sales
    const sortedBySales = [...parsedData.asins]
      .filter(a => a.totalSales > 0)
      .sort((a, b) => b.totalSales - a.totalSales);
    
    const totalSales = sortedBySales.reduce((s, a) => s + a.totalSales, 0);
    let cumulative = 0;
    
    const pareto = sortedBySales.slice(0, 15).map((a, i) => {
      cumulative += a.totalSales;
      return {
        asin: a.asin.slice(0, 10),
        sales: a.totalSales,
        cumulativePct: Math.round((cumulative / totalSales) * 100)
      };
    });

    // Scatter chart - conversion vs spend
    const scatter = parsedData.asins
      .filter(a => a.totalSpend > 0 && a.avgConversion !== 'N/A')
      .map(a => ({
        asin: a.asin,
        spend: a.totalSpend,
        conversion: a.avgConversion,
        sales: a.totalSales,
        size: Math.sqrt(a.totalSales) * 2
      }));

    return { pareto, scatter };
  }, [parsedData]);

  // PDF Export
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#050B18',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`AdsGupta_Audit_${fileName || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }

    setIsExporting(false);
  };

  // Export findings to CSV
  const handleExportCSV = () => {
    if (agentResults?.results) {
      exportFindingsToCSV(agentResults.results, `AdsGupta_Findings_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  if (!parsedData || !agentResults) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Analyzing your data...</p>
          <p className="text-zinc-500 text-sm">Running 20 AI optimization agents</p>
        </div>
      </div>
    );
  }

  const { summary, asins, searchTerms, availableMetrics, missingMetrics, totalRows, columns } = parsedData;
  const { healthScore, criticalCount, warningCount, opportunityCount } = agentResults.summary;

  // Separate findings by type
  const criticalFindings = [];
  const opportunityFindings = [];
  const infoFindings = [];

  agentResults.results.forEach(agent => {
    agent.findings?.forEach(f => {
      if (f.severity === 'critical' || f.type === 'alert') {
        criticalFindings.push({ ...f, agentName: agent.name });
      } else if (f.type === 'opportunity' || f.type === 'success') {
        opportunityFindings.push({ ...f, agentName: agent.name });
      } else {
        infoFindings.push({ ...f, agentName: agent.name });
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />

      <main className="relative pt-28 pb-24" ref={reportRef}>
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <button
                onClick={() => { clearData(); navigate('/audit'); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                New Audit
              </button>
              <h1 className="text-3xl font-bold text-white font-['Manrope'] tracking-tight mb-2">
                Deep Analysis Report
              </h1>
              <p className="text-zinc-400">
                Analyzed <span className="text-blue-400 font-semibold">{totalRows?.toLocaleString()}</span> rows from{' '}
                <span className="text-white">{fileName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <FileText size={16} />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
            </div>
          </div>

          {/* Health Score & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1 p-6 rounded-2xl bg-[#0A1628] border border-white/5 flex flex-col items-center justify-center">
              <HealthScoreGauge score={healthScore} />
              <div className="flex items-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-red-400 text-xl font-bold">{criticalCount}</p>
                  <p className="text-zinc-500 text-xs">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 text-xl font-bold">{warningCount}</p>
                  <p className="text-zinc-500 text-xs">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-400 text-xl font-bold">{opportunityCount}</p>
                  <p className="text-zinc-500 text-xs">Opportunities</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard 
                label="Total Sales" 
                value={summary?.totalSales} 
                prefix="$" 
                icon={DollarSign} 
                color="text-emerald-400" 
              />
              <KPICard 
                label="Total Units" 
                value={summary?.totalUnits} 
                icon={Package} 
                color="text-cyan-400" 
              />
              <KPICard 
                label="Total Spend" 
                value={summary?.totalSpend} 
                prefix="$" 
                icon={BarChart3} 
                color="text-rose-400" 
              />
              <KPICard 
                label="Avg ACOS" 
                value={summary?.avgAcos === Infinity ? '∞' : summary?.avgAcos} 
                suffix="%" 
                icon={Percent} 
                color="text-amber-400" 
              />
              <KPICard 
                label="Sessions" 
                value={summary?.totalSessions} 
                icon={Eye} 
                color="text-blue-400" 
              />
              <KPICard 
                label="Conversion" 
                value={summary?.avgConversion} 
                suffix="%" 
                icon={Target} 
                color="text-violet-400" 
              />
              <KPICard 
                label="ROAS" 
                value={summary?.avgRoas} 
                suffix="x" 
                icon={TrendingUp} 
                color="text-emerald-400" 
              />
              <KPICard 
                label="Unique ASINs" 
                value={asins?.length} 
                icon={Package} 
                color="text-orange-400" 
              />
            </div>
          </div>

          {/* Data Available/Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} /> Detected Metrics ({availableMetrics?.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableMetrics?.map(m => (
                  <span key={m} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle size={14} /> Missing for Full Analysis ({missingMetrics?.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingMetrics?.map(m => (
                  <span key={m} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'findings', 'asins', 'charts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Critical Issues */}
                {criticalFindings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-400" />
                      Critical Issues ({criticalFindings.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {criticalFindings.slice(0, 4).map((f, i) => (
                        <FindingCard key={i} finding={f} agentName={f.agentName} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {opportunityFindings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" />
                      Growth Opportunities ({opportunityFindings.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunityFindings.slice(0, 4).map((f, i) => (
                        <FindingCard key={i} finding={f} agentName={f.agentName} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'findings' && (
              <motion.div
                key="findings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">All Agent Findings</h3>
                {agentResults.results.map((agent, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0A1628] border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <Bot size={16} className="text-blue-400" />
                      <span className="text-white font-medium">{agent.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        agent.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                        agent.status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {agent.findings?.map((f, j) => (
                        <FindingCard key={j} finding={f} />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'asins' && (
              <motion.div
                key="asins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DataTable
                  title="ASIN Performance"
                  data={asins || []}
                  columns={[
                    { key: 'asin', label: 'ASIN', color: 'text-white' },
                    { key: 'totalSales', label: 'Sales', prefix: '$', color: 'text-emerald-400', align: 'right' },
                    { key: 'totalUnits', label: 'Units', color: 'text-cyan-400', align: 'right' },
                    { key: 'totalSpend', label: 'Spend', prefix: '$', color: 'text-rose-400', align: 'right' },
                    { key: 'avgAcos', label: 'ACOS', suffix: '%', color: 'text-amber-400', align: 'right',
                      render: (v) => v === 'N/A' || v === Infinity ? 'N/A' : `${v.toFixed(1)}%`
                    },
                    { key: 'avgConversion', label: 'Conv %', color: 'text-violet-400', align: 'right',
                      render: (v) => v === 'N/A' ? 'N/A' : `${v.toFixed(2)}%`
                    },
                    { key: 'avgRoas', label: 'ROAS', suffix: 'x', color: 'text-emerald-400', align: 'right',
                      render: (v) => v === 'N/A' ? 'N/A' : `${v.toFixed(2)}x`
                    }
                  ]}
                />
              </motion.div>
            )}

            {activeTab === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Pareto Chart */}
                <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">Pareto Analysis (80/20 Rule)</h3>
                  {chartData.pareto.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.pareto}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="asin" stroke="#52525B" fontSize={10} tickLine={false} angle={-45} textAnchor="end" height={60} />
                        <YAxis yAxisId="left" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="sales" fill="#3B82F6" name="Sales" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="cumulativePct" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} name="Cumulative %" />
                        <ReferenceLine yAxisId="right" y={80} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '80%', fill: '#F59E0B', fontSize: 10 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500 text-center py-12">No ASIN sales data available</p>
                  )}
                </div>

                {/* Scatter Chart */}
                <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">Spend vs Conversion</h3>
                  {chartData.scatter.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="spend" stroke="#52525B" fontSize={10} tickLine={false} name="Spend" tickFormatter={(v) => `$${v}`} />
                        <YAxis dataKey="conversion" stroke="#52525B" fontSize={10} tickLine={false} name="Conversion" tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter name="ASINs" data={chartData.scatter} fill="#8B5CF6">
                          {chartData.scatter.map((entry, index) => (
                            <Cell key={index} fill={entry.conversion > 10 ? '#10B981' : entry.conversion > 5 ? '#F59E0B' : '#EF4444'} />
                          ))}
                        </Scatter>
                        <ReferenceLine y={10} stroke="#10B981" strokeDasharray="3 3" label={{ value: '10% target', fill: '#10B981', fontSize: 10 }} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500 text-center py-12">No spend/conversion data available</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10" />
            <div className="relative p-8 text-center space-y-4 border border-blue-500/20 rounded-2xl">
              <h3 className="text-2xl font-bold text-white font-['Manrope']">
                Ready for Real-Time Analytics?
              </h3>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Connect your Amazon SP-API to unlock live inventory sync, automated bid adjustments, 
                and 24/7 monitoring from all 20 AI agents.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  data-testid="connect-api-cta"
                >
                  Connect Amazon API
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                >
                  Explore Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalysisPage;
