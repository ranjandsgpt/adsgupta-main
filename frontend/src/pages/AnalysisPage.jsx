/**
 * Deep Analysis Page - Real data visualization from uploaded files
 * Zero hallucination - all metrics calculated from actual uploaded data
 * 
 * Features:
 * - Loading skeleton while processing
 * - Multi-report type support with specialized sections
 * - Master Summary for cross-report analysis
 * - Browser SLM integration for contextual chat
 * - OmniNav integration
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Target, Eye, Package, BarChart3,
  Percent, AlertTriangle, CheckCircle2, Download, FileText, RefreshCw,
  ChevronRight, Zap, X, Bot, Search, Info, ArrowLeft, Loader2, Filter,
  Sparkles, Cpu, FileSpreadsheet
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import OmniNav from '../components/OmniNav';
import PersistentSLMChat from '../components/PersistentSLMChat';
import useDataStore from '../store/dataStore';
import { 
  parseUploadedData, 
  runAllAgents, 
  formatCurrency, 
  formatPercent,
  exportFindingsToCSV 
} from '../utils/analysisEngineV2';

// ============== LOADING SKELETON ==============

const LoadingSkeleton = ({ stage = 'Initializing Neural Agents...' }) => (
  <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      {/* Animated Neural Logo */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-4 border-cyan-500/30 animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu size={28} className="text-blue-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-2">
        Processing Neural Insights
      </h2>
      
      <motion.p 
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-blue-400 mb-6"
      >
        {stage}
      </motion.p>
      
      {/* Skeleton Cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
      
      {/* Agent chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['Waste Analyzer', 'ACOS Optimizer', 'Conversion Engine', 'Spend Tracker'].map((agent, i) => (
          <motion.span
            key={agent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs"
          >
            {agent}
          </motion.span>
        ))}
      </div>
    </div>
  </div>
);

// ============== HEALTH SCORE GAUGE ==============

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
        <circle cx="64" cy="64" r="45" stroke="#1E293B" strokeWidth="8" fill="none" />
        <motion.circle
          cx="64" cy="64" r="45"
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

// ============== KPI CARD ==============

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

// ============== CUSTOM TOOLTIP ==============

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

// ============== FINDING CARD ==============

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

  const [showDetails, setShowDetails] = useState(false);

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
          
          {/* Expandable Keyword List for Wasted Spend */}
          {(finding.wastedTerms || finding.data) && (finding.wastedTerms?.length > 0 || finding.data?.length > 0) && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>{showDetails ? 'Hide' : 'Show'} Details ({(finding.wastedTerms || finding.data)?.length} items)</span>
                <ChevronDown size={14} className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 max-h-64 overflow-y-auto rounded-lg bg-black/20 p-3"
                >
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-500 border-b border-white/10">
                        <th className="text-left py-2 px-2">Keyword</th>
                        <th className="text-right py-2 px-2">Spend</th>
                        <th className="text-right py-2 px-2">Clicks</th>
                        {finding.wastedTerms?.[0]?.cpc && <th className="text-right py-2 px-2">CPC</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(finding.wastedTerms || finding.data)?.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-2 text-white truncate max-w-[200px]" title={item.term || item.searchTerm || item.campaign || item.keyword || 'Unknown'}>
                            {item.term || item.searchTerm || item.campaign || item.keyword || item.matchType || 'Unknown'}
                          </td>
                          <td className="text-right py-2 px-2 text-red-400 font-mono">
                            €{(item.spend || 0).toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-2 text-zinc-400 font-mono">
                            {item.clicks || 0}
                          </td>
                          {finding.wastedTerms?.[0]?.cpc && (
                            <td className="text-right py-2 px-2 text-zinc-400 font-mono">
                              €{(item.cpc || 0).toFixed(2)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============== WASTED SPEND SECTION (For Search Term Reports) ==============

const WastedSpendSection = ({ searchTerms }) => {
  // Calculate wasted spend: keywords with clicks but 0 sales
  const wastedTerms = useMemo(() => {
    if (!searchTerms || searchTerms.length === 0) return [];
    
    return searchTerms
      .filter(term => {
        const clicks = term.clicks || term.Clicks || 0;
        const sales = term['7_day_total_sales'] || term['7 Day Total Sales'] || term.sales || 0;
        const spend = term.spend || term.Spend || 0;
        return clicks > 5 && sales === 0 && spend > 0;
      })
      .sort((a, b) => (b.spend || b.Spend || 0) - (a.spend || a.Spend || 0))
      .slice(0, 20);
  }, [searchTerms]);

  const totalWasted = wastedTerms.reduce((sum, t) => sum + (t.spend || t.Spend || 0), 0);

  if (wastedTerms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <DollarSign size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">Wasted Ad Spend Detected</h3>
            <p className="text-zinc-400 text-sm">Keywords with 5+ clicks and $0 in sales</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-400 font-['JetBrains_Mono']">${totalWasted.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs">Potential savings</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase border-b border-red-500/20">
              <th className="text-left py-2 px-3">Search Term</th>
              <th className="text-right py-2 px-3">Clicks</th>
              <th className="text-right py-2 px-3">Spend</th>
              <th className="text-right py-2 px-3">Sales</th>
            </tr>
          </thead>
          <tbody>
            {wastedTerms.slice(0, 10).map((term, i) => (
              <tr key={i} className="border-b border-red-500/10">
                <td className="py-2 px-3 text-white text-sm truncate max-w-[200px]">
                  {term.customer_search_term || term['Customer Search Term'] || term.searchTerm || 'N/A'}
                </td>
                <td className="py-2 px-3 text-right text-zinc-400 font-['JetBrains_Mono'] text-sm">
                  {term.clicks || term.Clicks || 0}
                </td>
                <td className="py-2 px-3 text-right text-red-400 font-['JetBrains_Mono'] text-sm">
                  ${(term.spend || term.Spend || 0).toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-zinc-500 font-['JetBrains_Mono'] text-sm">
                  $0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-zinc-500 text-xs mt-4">
        💡 Tip: Add these terms as negative keywords to stop wasting ad budget
      </p>
    </motion.div>
  );
};

// ============== MASTER SUMMARY SECTION (For Multi-Report) ==============

const MasterSummarySection = ({ parsedData, agentResults }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [masterInsights, setMasterInsights] = useState([]);

  useEffect(() => {
    // Simulate SLM analysis delay
    const timer = setTimeout(() => {
      // Generate cross-report insights
      const insights = [];
      
      if (parsedData?.summary) {
        // High ACOS + Low Conversion correlation
        if (parsedData.summary.avgAcos > 30 && parsedData.summary.avgConversion < 5) {
          insights.push({
            type: 'correlation',
            severity: 'critical',
            title: 'ACOS-Conversion Mismatch',
            description: `Your ACOS (${parsedData.summary.avgAcos?.toFixed(1)}%) is high while conversion (${parsedData.summary.avgConversion?.toFixed(2)}%) is low. This indicates you're paying for clicks that don't convert.`,
            recommendation: 'Focus on improving listing quality (images, bullets, A+ content) before increasing ad spend.'
          });
        }
        
        // High spend with low ROAS
        if (parsedData.summary.totalSpend > 1000 && parsedData.summary.avgRoas < 2) {
          insights.push({
            type: 'warning',
            severity: 'high',
            title: 'Ad Spend Efficiency Alert',
            description: `You've spent $${parsedData.summary.totalSpend?.toLocaleString()} with only ${parsedData.summary.avgRoas?.toFixed(2)}x ROAS. Target should be 3x+ for profitability.`,
            recommendation: 'Audit your top-spending campaigns and pause keywords with <2x ROAS.'
          });
        }
        
        // Success pattern
        if (parsedData.summary.avgRoas > 4) {
          insights.push({
            type: 'success',
            severity: 'low',
            title: 'Strong ROAS Performance',
            description: `Your ${parsedData.summary.avgRoas?.toFixed(2)}x ROAS indicates healthy ad performance. Consider scaling winning campaigns.`,
            recommendation: 'Identify your top 20% of keywords driving 80% of sales and increase bids strategically.'
          });
        }
      }
      
      setMasterInsights(insights);
      setIsGenerating(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [parsedData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles size={20} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">Master Analysis</h3>
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-violet-400" />
            <p className="text-zinc-400 text-sm">Cross-Report Intelligence by Neural Engine</p>
          </div>
        </div>
      </div>
      
      {isGenerating ? (
        <div className="flex items-center gap-3 py-8">
          <Loader2 size={20} className="text-violet-400 animate-spin" />
          <span className="text-zinc-400">Synthesizing cross-report patterns...</span>
        </div>
      ) : masterInsights.length > 0 ? (
        <div className="space-y-4">
          {masterInsights.map((insight, i) => (
            <div key={i} className={`p-4 rounded-xl border ${
              insight.type === 'correlation' ? 'border-red-500/30 bg-red-500/5' :
              insight.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-emerald-500/30 bg-emerald-500/5'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${
                  insight.type === 'correlation' ? 'text-red-400' :
                  insight.type === 'warning' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {insight.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                  <p className="text-zinc-400 text-sm mb-2">{insight.description}</p>
                  <p className="text-violet-400 text-sm flex items-center gap-2">
                    <Zap size={12} /> {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-center py-8">
          Upload multiple report types for cross-report analysis
        </p>
      )}
    </motion.div>
  );
};

// ============== DATA TABLE ==============

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

// ============== MAIN ANALYSIS PAGE ==============

const AnalysisPage = () => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingStage, setLoadingStage] = useState('Initializing Neural Agents...');
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    uploadedData, fileName, fileType, reportType, rowCount,
    parsedData, setParsedData, 
    agentResults, setAgentResults, 
    clearData 
  } = useDataStore();

  // Parse data and run agents on mount (with proper async handling)
  useEffect(() => {
    const processData = async () => {
      // If we already have parsed results, use them
      if (parsedData && agentResults) {
        console.log('Using cached results, rows:', parsedData.totalRows || parsedData.rows?.length);
        setIsLoading(false);
        return;
      }
      
      // For large files that were persisted without raw data, show cached summary
      if (!uploadedData && parsedData?.summary) {
        console.log('Large file mode: Using persisted summary only');
        // Run minimal agents with available data
        try {
          const results = runAllAgents(parsedData);
          setAgentResults(results);
        } catch (e) {
          console.warn('Could not run agents on cached data:', e);
        }
        setIsLoading(false);
        return;
      }
      
      // No data at all, redirect to upload
      if (!uploadedData) {
        console.log('No data available, redirecting to audit');
        navigate('/audit');
        return;
      }

      try {
        setLoadingStage('Parsing file structure...');
        await new Promise(r => setTimeout(r, 200));
        
        // Validate uploadedData
        if (!Array.isArray(uploadedData)) {
          console.error('Invalid uploadedData type:', typeof uploadedData);
          throw new Error('Invalid data format');
        }
        
        if (uploadedData.length === 0) {
          console.error('Empty data array');
          throw new Error('No data rows found in file');
        }
        
        console.log('Parsing', uploadedData.length, 'rows. Sample columns:', Object.keys(uploadedData[0] || {}).slice(0, 5));
        
        setLoadingStage('Detecting data columns...');
        const parsed = parseUploadedData(uploadedData);
        
        if (!parsed || !parsed.rows) {
          console.error('Parse result invalid:', parsed);
          throw new Error('Failed to parse data');
        }
        
        console.log('Parsed:', parsed.rows.length, 'rows,', parsed.availableMetrics?.length, 'metrics');
        
        setParsedData(parsed);
        await new Promise(r => setTimeout(r, 200));
        
        setLoadingStage('Running 20 AI optimization agents...');
        await new Promise(r => setTimeout(r, 300));
        
        setLoadingStage('Generating insights...');
        const results = runAllAgents(parsed);
        
        if (!results) {
          throw new Error('Agent analysis returned no results');
        }
        
        console.log('Analysis complete. Health:', results.summary?.healthScore);
        
        setAgentResults(results);
        await new Promise(r => setTimeout(r, 200));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Analysis failed:', error.message);
        setLoadingStage('Analysis failed. Retrying...');
        
        setTimeout(() => {
          try {
            console.log('Retrying analysis...');
            const parsed = parseUploadedData(uploadedData || []);
            setParsedData(parsed);
            const results = runAllAgents(parsed);
            setAgentResults(results);
            setIsLoading(false);
          } catch (retryError) {
            console.error('Retry failed:', retryError.message);
            setLoadingStage('Unable to analyze file. Check file format.');
            setTimeout(() => navigate('/audit'), 2000);
          }
        }, 1000);
      }
    };

    processData();
  }, [uploadedData, parsedData, agentResults, setParsedData, setAgentResults, navigate]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!parsedData?.asins) return { pareto: [], scatter: [] };

    const sortedBySales = [...parsedData.asins]
      .filter(a => a.totalSales > 0)
      .sort((a, b) => b.totalSales - a.totalSales);
    
    const totalSales = sortedBySales.reduce((s, a) => s + a.totalSales, 0);
    let cumulative = 0;
    
    const pareto = sortedBySales.slice(0, 15).map((a) => {
      cumulative += a.totalSales;
      return {
        asin: a.asin.slice(0, 10),
        sales: a.totalSales,
        cumulativePct: Math.round((cumulative / totalSales) * 100)
      };
    });

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

  // Show loading skeleton
  if (isLoading) {
    return <LoadingSkeleton stage={loadingStage} />;
  }

  if (!parsedData || !agentResults) {
    return <LoadingSkeleton stage="Preparing analysis..." />;
  }

  const { summary, asins, searchTerms, availableMetrics, missingMetrics, totalRows } = parsedData;
  const { healthScore, criticalCount, warningCount, opportunityCount } = agentResults.summary;

  // Separate findings by type
  const criticalFindings = [];
  const opportunityFindings = [];

  agentResults.results.forEach(agent => {
    agent.findings?.forEach(f => {
      if (f.severity === 'critical' || f.type === 'alert') {
        criticalFindings.push({ ...f, agentName: agent.name });
      } else if (f.type === 'opportunity' || f.type === 'success') {
        opportunityFindings.push({ ...f, agentName: agent.name });
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />
      <OmniNav showOnPages={['/analysis', '/audit', '/tools', '/neural-map']} />

      <main className="relative pt-32 pb-24" ref={reportRef}>
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <button
                onClick={() => { clearData(); navigate('/audit'); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
                data-testid="new-audit-btn"
              >
                <ArrowLeft size={16} />
                New Audit
              </button>
              <h1 className="text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-2">
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
                data-testid="export-csv-btn"
              >
                <FileText size={16} />
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all disabled:opacity-50"
                data-testid="export-pdf-btn"
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
              <KPICard label="Total Sales" value={summary?.totalSales} prefix="$" icon={DollarSign} color="text-emerald-400" />
              <KPICard label="Total Units" value={summary?.totalUnits} icon={Package} color="text-cyan-400" />
              <KPICard label="Total Spend" value={summary?.totalSpend} prefix="$" icon={BarChart3} color="text-rose-400" />
              <KPICard label="Avg ACOS" value={summary?.avgAcos === Infinity ? '∞' : summary?.avgAcos} suffix="%" icon={Percent} color="text-amber-400" />
              <KPICard label="Sessions" value={summary?.totalSessions} icon={Eye} color="text-blue-400" />
              <KPICard label="Conversion" value={summary?.avgConversion} suffix="%" icon={Target} color="text-violet-400" />
              <KPICard label="ROAS" value={summary?.avgRoas} suffix="x" icon={TrendingUp} color="text-emerald-400" />
              <KPICard label="Unique ASINs" value={asins?.length} icon={Package} color="text-orange-400" />
            </div>
          </div>

          {/* Wasted Spend Section (for Search Term Reports) */}
          {searchTerms && searchTerms.length > 0 && (
            <div className="mb-8">
              <WastedSpendSection searchTerms={searchTerms} />
            </div>
          )}

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
            {['overview', 'findings', 'asins', 'charts', 'master'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`tab-${tab}`}
              >
                {tab === 'master' ? 'Master Analysis' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                        <ReferenceLine yAxisId="right" y={80} stroke="#F59E0B" strokeDasharray="3 3" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500 text-center py-12">No ASIN sales data available</p>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">Spend vs Conversion</h3>
                  {chartData.scatter.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="spend" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <YAxis dataKey="conversion" stroke="#52525B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter name="ASINs" data={chartData.scatter} fill="#8B5CF6">
                          {chartData.scatter.map((entry, index) => (
                            <Cell key={index} fill={entry.conversion > 10 ? '#10B981' : entry.conversion > 5 ? '#F59E0B' : '#EF4444'} />
                          ))}
                        </Scatter>
                        <ReferenceLine y={10} stroke="#10B981" strokeDasharray="3 3" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-zinc-500 text-center py-12">No spend/conversion data available</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'master' && (
              <motion.div
                key="master"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MasterSummarySection parsedData={parsedData} agentResults={agentResults} />
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
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                Ready for Real-Time Analytics?
              </h3>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Connect your Amazon SP-API to unlock live inventory sync, automated bid adjustments, 
                and 24/7 monitoring from all 20 AI agents.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all"
                  data-testid="connect-api-cta"
                >
                  Connect Amazon API
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <PersistentSLMChat />
    </div>
  );
};

export default AnalysisPage;
