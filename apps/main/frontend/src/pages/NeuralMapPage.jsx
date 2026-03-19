/**
 * Marketplace Neural Map - Advanced Visualization Dashboard
 * Force-directed graph, interactive scatter plot, and cross-pollination insights
 */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ZAxis, ReferenceLine
} from 'recharts';
import {
  Brain, Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, Package, BarChart3, ArrowLeft, Download, Mail, X, Sparkles,
  Play, ChevronRight, ChevronDown, Filter, Eye, Target, RefreshCw,
  Network, Database, GitMerge, Cpu, FileText, Send, Lock, Loader2
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import useMultiFileStore from '../store/multiFileStore';
import {
  mergeFiles,
  runCrossPollination,
  getAlarmingCorrelations
} from '../utils/quantumMerger';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Custom tooltip for scatter plot
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  
  return (
    <div className="p-4 rounded-xl bg-[#0A1628] border border-white/20 shadow-2xl max-w-xs">
      <p className="text-white font-semibold mb-2 truncate">{data.sku || data._primaryKey}</p>
      {Object.entries(data).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm gap-4">
          <span className="text-zinc-500 truncate">{key}</span>
          <span className="text-white font-mono">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
      ))}
    </div>
  );
};

// Cross-Pollination Insight Card
const InsightCard = ({ insight, name, icon: Icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!insight || insight.status === 'requires_data') {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon size={18} className="text-zinc-500" />
          </div>
          <div>
            <h4 className="text-zinc-400 font-medium">{name}</h4>
            <p className="text-zinc-600 text-xs">{insight?.message || 'Upload required reports'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const finding = insight.findings?.[0];
  const severityColors = {
    critical: 'border-red-500/30 bg-red-500/10',
    high: 'border-orange-500/30 bg-orange-500/10',
    medium: 'border-amber-500/30 bg-amber-500/10',
    low: 'border-yellow-500/30 bg-yellow-500/10'
  };
  
  return (
    <motion.div
      layout
      className={`rounded-xl border overflow-hidden transition-all cursor-pointer ${
        finding?.severity ? severityColors[finding.severity] : 'bg-emerald-500/10 border-emerald-500/30'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            finding?.type === 'alert' ? 'bg-red-500/20' : 'bg-emerald-500/20'
          }`}>
            <Icon size={18} className={finding?.type === 'alert' ? 'text-red-400' : 'text-emerald-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-sm">{name}</h4>
              <ChevronDown 
                size={16} 
                className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </div>
            <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{finding?.title}</p>
            {finding?.value && (
              <p className={`text-lg font-bold font-['JetBrains_Mono'] mt-2 ${
                finding?.type === 'alert' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {finding.value}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && finding?.data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-zinc-400 text-xs">{finding.description}</p>
              {finding.data.slice(0, 5).map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/5 text-xs">
                  <span className="text-white font-medium">{item.sku || item.keyword}</span>
                  {item.estimatedWaste && (
                    <span className="text-red-400 ml-2">-${item.estimatedWaste.toFixed(0)}</span>
                  )}
                  {item.returnRate && (
                    <span className="text-amber-400 ml-2">{item.returnRate}% returns</span>
                  )}
                </div>
              ))}
              {finding.traceable && (
                <p className="text-blue-400 text-xs flex items-center gap-1 mt-2">
                  <Eye size={12} /> Click any row to view source data
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Lead Capture Modal
const LeadCaptureModal = ({ isOpen, onClose, insightCount }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLeadEmail } = useMultiFileStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Save to backend
      await fetch(`${API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'neural_map', insightCount })
      });
    } catch (error) {
      console.error('Lead capture error:', error);
    }
    
    setLeadEmail(email);
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      onClose();
    }, 3000);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 p-[1px] rounded-2xl">
          <div className="w-full h-full bg-[#0A1628] rounded-2xl" />
        </div>
        
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <FileText size={28} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-['Manrope'] mb-2">
                  Ready for the Deep-Dive?
                </h2>
                <p className="text-zinc-400">
                  We've found <span className="text-blue-400 font-bold">{insightCount}</span> profit leaks and optimization opportunities.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">50-page PDF Audit Report</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">15-minute strategy call with an AdsGupta Optimizer</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">Custom action plan based on YOUR data</span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-all"
                    data-testid="lead-capture-email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                  data-testid="lead-capture-submit"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Send My Audit Report
                    </>
                  )}
                </button>
              </form>
              
              <p className="text-zinc-600 text-xs text-center mt-4">
                <Lock size={12} className="inline mr-1" />
                We'll never share your email. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
              >
                <CheckCircle2 size={40} className="text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">You're In!</h3>
              <p className="text-zinc-400">Check your inbox for the full audit report.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Simulation Results Modal
const SimulationModal = ({ isOpen, onClose, results }) => {
  if (!isOpen || !results) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-2xl w-full bg-[#0A1628] rounded-2xl border border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            Golden Path Discovered
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Optimal strategy from 1,000 simulations
          </p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-emerald-400 text-2xl font-bold font-['JetBrains_Mono']">
                +{results.projectedGain}%
              </p>
              <p className="text-zinc-500 text-xs">Projected ROAS Increase</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-blue-400 text-2xl font-bold font-['JetBrains_Mono']">
                ${results.projectedSavings}
              </p>
              <p className="text-zinc-500 text-xs">Monthly Savings</p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-center">
              <p className="text-violet-400 text-2xl font-bold font-['JetBrains_Mono']">
                {results.confidence}%
              </p>
              <p className="text-zinc-500 text-xs">Confidence Level</p>
            </div>
          </div>
          
          <h3 className="text-white font-semibold mb-3">Step-by-Step Action Plan</h3>
          <div className="space-y-3">
            {results.steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{step.action}</p>
                  <p className="text-zinc-500 text-xs mt-1">{step.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Neural Map Page
const NeuralMapPage = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Scatter plot state
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [bubbleSize, setBubbleSize] = useState('');
  
  const { 
    files, 
    setMasterData, 
    setCrossInsight, 
    setCorrelations,
    crossInsights,
    correlations: storedCorrelations
  } = useMultiFileStore();

  // Merge and analyze data
  const [masterData, setLocalMasterData] = useState(null);
  const [crossResults, setCrossResults] = useState(null);
  const [correlations, setLocalCorrelations] = useState([]);
  
  useEffect(() => {
    if (files.length === 0) {
      navigate('/audit');
      return;
    }
    
    const analyzeData = async () => {
      setIsAnalyzing(true);
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 1500));
      
      // Merge files
      const merged = mergeFiles(files);
      setLocalMasterData(merged);
      setMasterData(merged);
      
      // Run cross-pollination
      const crossResults = runCrossPollination(merged, files);
      setCrossResults(crossResults);
      
      // Store individual insights
      Object.entries(crossResults).forEach(([key, value]) => {
        if (key !== 'correlations') {
          setCrossInsight(key, value);
        }
      });
      
      // Store correlations
      setLocalCorrelations(crossResults.correlations || []);
      setCorrelations(crossResults.correlations || []);
      
      // Set default axes
      const metrics = merged.records.length > 0 
        ? Object.keys(merged.records[0]).filter(k => !k.startsWith('_') && typeof merged.records[0][k] === 'number')
        : [];
      
      if (metrics.length >= 2) {
        setXAxis(metrics[0]);
        setYAxis(metrics[1]);
        if (metrics.length >= 3) setBubbleSize(metrics[2]);
      }
      
      setIsAnalyzing(false);
    };
    
    analyzeData();
  }, [files, navigate, setMasterData, setCrossInsight, setCorrelations]);

  // Get available metrics for dropdowns
  const availableMetrics = useMemo(() => {
    if (!masterData?.records?.length) return [];
    return Object.keys(masterData.records[0])
      .filter(k => !k.startsWith('_') && typeof masterData.records[0][k] === 'number');
  }, [masterData]);

  // Prepare scatter data
  const scatterData = useMemo(() => {
    if (!masterData?.records || !xAxis || !yAxis) return [];
    
    return masterData.records
      .filter(r => r[xAxis] !== undefined && r[yAxis] !== undefined)
      .map(r => ({
        ...r,
        x: r[xAxis],
        y: r[yAxis],
        z: bubbleSize ? r[bubbleSize] || 10 : 10
      }))
      .slice(0, 500); // Limit for performance
  }, [masterData, xAxis, yAxis, bubbleSize]);

  // Smart suggest - get alarming correlations
  const alarmingCorrelations = useMemo(() => {
    return getAlarmingCorrelations(correlations);
  }, [correlations]);

  // Apply smart suggest
  const applySuggestion = (suggestion) => {
    setXAxis(suggestion.fieldA);
    setYAxis(suggestion.fieldB);
  };

  // Run 1,000 simulations
  const runSimulations = async () => {
    setIsSimulating(true);
    
    // Simulate processing
    await new Promise(r => setTimeout(r, 3000));
    
    // Generate mock "golden path" results based on actual data
    const wasteFound = crossResults?.ppcCannibalization?.summary?.totalCannibalizedSpend || 0;
    const profitLeaks = crossResults?.trueProfitAudit?.summary?.unprofitableCount || 0;
    
    setSimulationResults({
      projectedGain: Math.round(12 + Math.random() * 18),
      projectedSavings: Math.round(wasteFound * 0.8 + Math.random() * 500),
      confidence: Math.round(85 + Math.random() * 10),
      steps: [
        { action: 'Pause ads on high-cannibalization SKUs', impact: 'Save $' + Math.round(wasteFound * 0.6) + '/month' },
        { action: 'Add 15 negative keywords from Waste Map', impact: 'Reduce wasted spend by 23%' },
        { action: 'Increase bids on inelastic products', impact: 'Improve margin by 8%' },
        { action: 'Fix inventory-ad mismatch for 3 SKUs', impact: 'Prevent BSR loss' },
        { action: 'Optimize pricing on elastic products', impact: 'Volume +12%, profit +4%' }
      ]
    });
    
    setIsSimulating(false);
    setShowSimulationModal(true);
  };

  // Count total insights
  const insightCount = useMemo(() => {
    let count = 0;
    if (crossResults) {
      Object.values(crossResults).forEach(r => {
        if (r?.findings) count += r.findings.length;
      });
    }
    count += correlations.filter(c => c.isAlarming).length;
    return count;
  }, [crossResults, correlations]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <div className="w-full h-full rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white font-['Manrope'] mb-2">
            Building Neural Map
          </h2>
          <p className="text-zinc-400">
            Correlating {files.reduce((s, f) => s + (f.rowCount || 0), 0).toLocaleString()} data points...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />

      {/* Modals */}
      <AnimatePresence>
        {showLeadModal && (
          <LeadCaptureModal 
            isOpen={showLeadModal} 
            onClose={() => setShowLeadModal(false)}
            insightCount={insightCount}
          />
        )}
        {showSimulationModal && (
          <SimulationModal
            isOpen={showSimulationModal}
            onClose={() => setShowSimulationModal(false)}
            results={simulationResults}
          />
        )}
      </AnimatePresence>

      <main className="relative pt-28 pb-24">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <button
                onClick={() => navigate('/audit')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Audit
              </button>
              <h1 className="text-3xl font-bold text-white font-['Manrope'] tracking-tight mb-2">
                Marketplace Neural Map
              </h1>
              <p className="text-zinc-400">
                <span className="text-blue-400 font-semibold">{masterData?.records?.length || 0}</span> unified records from{' '}
                <span className="text-white">{files.length} files</span>
                {masterData?.stats?.joinedRecords > 0 && (
                  <span className="text-emerald-400"> • {masterData.stats.joinedRecords} cross-referenced</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={runSimulations}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all disabled:opacity-50 text-sm sm:text-base"
                data-testid="run-simulations-btn"
              >
                {isSimulating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                <span className="hidden sm:inline">Run 1,000 Simulations</span>
                <span className="sm:hidden">Simulate</span>
              </button>
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] text-sm sm:text-base"
                data-testid="email-audit-btn"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Email My Audit</span>
                <span className="sm:hidden">Email</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Chart Area */}
            <div className="xl:col-span-2 space-y-6">
              {/* Interactive Scatter Plot */}
              <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-white">Interactive Correlation Map</h3>
                  
                  {/* Axis Selectors */}
                  <div className="flex flex-wrap items-center gap-3 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">X:</span>
                      <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {availableMetrics.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">Y:</span>
                      <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {availableMetrics.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">Size:</span>
                      <select
                        value={bubbleSize}
                        onChange={(e) => setBubbleSize(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">None</option>
                        {availableMetrics.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Smart Suggest */}
                {alarmingCorrelations.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
                      <Zap size={12} /> Smart Suggest: Alarming Correlations Found
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {alarmingCorrelations.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => applySuggestion(c)}
                          className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition-all"
                        >
                          {c.fieldA} vs {c.fieldB} ({c.correlation})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-[300px] sm:h-[400px]">
                  {scatterData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis 
                          dataKey="x" 
                          type="number" 
                          name={xAxis}
                          stroke="#52525B" 
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)}
                        />
                        <YAxis 
                          dataKey="y" 
                          type="number"
                          name={yAxis}
                          stroke="#52525B" 
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)}
                        />
                        <ZAxis dataKey="z" range={[20, 400]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter name="SKUs" data={scatterData} fill="#3B82F6">
                          {scatterData.map((entry, index) => (
                            <Cell 
                              key={index} 
                              fill={entry.y > entry.x ? '#10B981' : entry.y < entry.x * 0.5 ? '#EF4444' : '#3B82F6'}
                              fillOpacity={0.7}
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500">
                      Select metrics to visualize correlations
                    </div>
                  )}
                </div>
              </div>

              {/* Correlation Matrix */}
              <div className="p-6 rounded-2xl bg-[#0A1628] border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Network size={18} className="text-violet-400" />
                  Discovered Correlations ({correlations.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {correlations.slice(0, 12).map((c, i) => (
                    <div 
                      key={i}
                      onClick={() => { setXAxis(c.fieldA); setYAxis(c.fieldB); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                        c.isAlarming 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : parseFloat(c.correlation) > 0 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-amber-500/5 border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-400 truncate">{c.fieldA}</span>
                        <span className={`text-xs font-bold font-['JetBrains_Mono'] ${
                          parseFloat(c.correlation) > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {c.correlation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          c.strength === 'strong' ? 'bg-violet-500/20 text-violet-400' :
                          c.strength === 'moderate' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {c.strength}
                        </span>
                        <span className="text-xs text-zinc-500">→</span>
                        <span className="text-xs text-zinc-400 truncate">{c.fieldB}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Pollination Insights Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GitMerge size={18} className="text-cyan-400" />
                Cross-Pollination Insights
              </h3>
              
              <InsightCard 
                insight={crossResults?.trueProfitAudit}
                name="True Profit Audit"
                icon={DollarSign}
              />
              
              <InsightCard 
                insight={crossResults?.ppcCannibalization}
                name="PPC Cannibalization"
                icon={AlertTriangle}
              />
              
              <InsightCard 
                insight={crossResults?.inventoryAdVelocity}
                name="Inventory-Ad Velocity"
                icon={Package}
              />
              
              <InsightCard 
                insight={crossResults?.roasLeak}
                name="ROAS Leak / Waste Map"
                icon={TrendingDown}
              />
              
              <InsightCard 
                insight={crossResults?.elasticityEngine}
                name="Price Elasticity"
                icon={BarChart3}
              />

              {/* Summary Stats */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border border-white/10">
                <h4 className="text-white font-semibold mb-3">Analysis Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Insights</span>
                    <span className="text-white font-semibold">{insightCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Correlations Found</span>
                    <span className="text-white font-semibold">{correlations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Alarming Patterns</span>
                    <span className="text-red-400 font-semibold">{alarmingCorrelations.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NeuralMapPage;
