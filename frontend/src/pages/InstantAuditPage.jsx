import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload, FileSpreadsheet, AlertTriangle, TrendingUp, TrendingDown,
  DollarSign, Target, ShoppingCart, BarChart3, Zap, Lock, ArrowRight,
  Sparkles, Eye, Percent, Package, RefreshCw, X, CheckCircle2, ExternalLink
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import MarketplaceContextSwitcher, { MARKETPLACES, ProtocolDevelopmentState } from '../components/MarketplaceContextSwitcher';
import useDataStore from '../store/dataStore';
import useMultiFileStore from '../store/multiFileStore';

// Domain config
const DEMO_DOMAIN = process.env.REACT_APP_DEMO_DOMAIN || 'https://demoai.adsgupta.com';

// Report type options
const REPORT_TYPES = [
  { id: 'search_term', label: 'Search Term Report', description: 'Keyword performance & wasted spend' },
  { id: 'targeting', label: 'Targeting Report', description: 'Campaign targeting analysis' },
  { id: 'advertised_product', label: 'Advertised Product Report', description: 'Product-level ad performance' },
  { id: 'business_report', label: 'Business Report', description: 'Sales & traffic data' },
  { id: 'other', label: 'Other Report', description: 'Generic analysis' },
];

// Instant Audit Dropzone Component - Supports Single or Multiple Files with Report Type Selection
const AuditDropzone = ({ onFileProcessed, onMultipleFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState('search_term');
  const [showReportTypeSelector, setShowReportTypeSelector] = useState(false);

  const processFile = useCallback((file) => {
    setIsProcessing(true);
    setFileName(file.name);
    setFileCount(1);

    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setTimeout(() => {
            onFileProcessed(results.data, 'csv', file.name, selectedReportType);
            setIsProcessing(false);
          }, 800);
        },
        error: () => setIsProcessing(false)
      });
    } else if (['xlsx', 'xls'].includes(extension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setTimeout(() => {
          onFileProcessed(jsonData, 'xlsx', file.name, selectedReportType);
          setIsProcessing(false);
        }, 800);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onFileProcessed, selectedReportType]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length >= 1) {
      // Process the first file
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length >= 1) {
      // Process the first file
      processFile(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75" />
      
      {/* Report Type Selector */}
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setShowReportTypeSelector(!showReportTypeSelector)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A1628] border border-white/10 text-white hover:border-blue-500/30 transition-all"
          data-testid="report-type-selector"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={18} className="text-blue-400" />
            <div className="text-left">
              <p className="text-sm font-medium">{REPORT_TYPES.find(r => r.id === selectedReportType)?.label}</p>
              <p className="text-xs text-zinc-500">{REPORT_TYPES.find(r => r.id === selectedReportType)?.description}</p>
            </div>
          </div>
          <motion.div animate={{ rotate: showReportTypeSelector ? 180 : 0 }}>
            <Package size={16} className="text-zinc-500" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {showReportTypeSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#0A1628] border border-white/10 shadow-xl z-10"
            >
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedReportType(type.id);
                    setShowReportTypeSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    selectedReportType === type.id
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                      : 'hover:bg-white/5 text-zinc-400'
                  }`}
                  data-testid={`report-type-${type.id}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedReportType === type.id ? 'border-blue-400' : 'border-zinc-600'
                  }`}>
                    {selectedReportType === type.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-zinc-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ 
          borderColor: isDragging ? '#3B82F6' : 'rgba(255,255,255,0.1)',
          backgroundColor: isDragging ? 'rgba(59,130,246,0.1)' : 'rgba(5,11,24,0.8)'
        }}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer
          ${isProcessing ? 'pointer-events-none' : ''}`}
        data-testid="audit-dropzone"
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto rounded-full border-4 border-blue-500/30 border-t-blue-500"
              />
              <p className="text-white font-semibold">Analyzing {fileName}...</p>
              <p className="text-zinc-500 text-sm">Running 20 AI optimization checks</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center"
              >
                <Upload size={36} className="text-blue-400" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Manrope'] mb-2">
                  Instant AI Audit
                </h3>
                <p className="text-zinc-400">
                  Drop your Amazon <span className="text-blue-400">Sales & Traffic</span> (CSV) or{' '}
                  <span className="text-cyan-400">Search Term</span> (XLSX) report
                </p>
                <p className="text-zinc-500 text-sm mt-2">
                  Select <span className="text-violet-400">multiple files</span> for Cross-Pollination Analysis
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet size={14} /> CSV
                </span>
                <span className="flex items-center gap-1">
                  <FileSpreadsheet size={14} /> XLSX
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Leak Alert Card Component
const LeakAlertCard = ({ alert, index, isBlurred }) => {
  const icons = {
    waste: DollarSign,
    conversion: Target,
    traffic: Eye,
    inventory: Package,
    price: TrendingDown,
    competition: BarChart3
  };
  const Icon = icons[alert.type] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`relative overflow-hidden ${isBlurred ? 'blur-sm' : ''}`}
    >
      <div className={`p-5 rounded-xl border ${alert.severity === 'critical' 
        ? 'bg-red-500/5 border-red-500/30' 
        : 'bg-amber-500/5 border-amber-500/30'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}>
            <Icon size={20} className={alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {alert.severity === 'critical' ? 'LEAK DETECTED' : 'OPPORTUNITY'}
              </span>
            </div>
            <p className="text-white font-semibold text-sm mb-1">{alert.title}</p>
            <p className="text-zinc-400 text-xs">{alert.description}</p>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold font-['JetBrains_Mono'] ${
              alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {alert.value}
            </p>
            <p className="text-zinc-500 text-xs">{alert.metric}</p>
          </div>
        </div>
      </div>
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050B18]/60 backdrop-blur-sm rounded-xl">
          <Lock size={20} className="text-zinc-500" />
        </div>
      )}
    </motion.div>
  );
};

// Quick Stats Grid
const QuickStatsGrid = ({ data }) => {
  const stats = [
    { label: 'Total Sales', value: data.totalSales, prefix: '$', color: 'text-emerald-400', icon: DollarSign },
    { label: 'Sessions', value: data.sessions, color: 'text-blue-400', icon: Eye },
    { label: 'Conversion', value: data.conversion, suffix: '%', color: 'text-violet-400', icon: Target },
    { label: 'Ad Spend', value: data.adSpend, prefix: '$', color: 'text-rose-400', icon: BarChart3 },
    { label: 'ACOS', value: data.acos, suffix: '%', color: 'text-amber-400', icon: Percent },
    { label: 'Units Sold', value: data.units, color: 'text-cyan-400', icon: Package },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 rounded-xl bg-[#050B18] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon size={14} className={stat.color} />
            <span className="text-zinc-500 text-xs uppercase tracking-wider">{stat.label}</span>
          </div>
          <p className={`text-2xl font-bold font-['JetBrains_Mono'] ${stat.color}`}>
            {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// Main Dashboard Page
const InstantAuditPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [activeMarketplace, setActiveMarketplace] = useState('amazon');
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  
  // Zustand stores
  const { setUploadedData, clearData } = useDataStore();
  const { addFile, clearAllFiles, detectReportType } = useMultiFileStore();

  // Get current marketplace config
  const currentMarketplace = MARKETPLACES.find(m => m.id === activeMarketplace) || MARKETPLACES[0];
  const isMarketplaceActive = currentMarketplace.status === 'active';

  const handleFileProcessed = useCallback(async (data, fileType, fileName, reportType = 'search_term') => {
    setIsProcessing(true);
    setProcessingStage('Parsing file structure...');
    
    // First, store data in Zustand and wait for it to persist
    await new Promise((resolve) => {
      setUploadedData(data, fileName, fileType, reportType);
      // Give Zustand time to persist to sessionStorage
      setTimeout(resolve, 100);
    });
    
    // Visual progress stages with async delays
    setProcessingStage('Detecting data columns...');
    await new Promise(r => setTimeout(r, 400));
    
    setProcessingStage('Running 20 AI agents...');
    await new Promise(r => setTimeout(r, 500));
    
    setProcessingStage('Generating insights...');
    await new Promise(r => setTimeout(r, 400));
    
    // Verify data is persisted before redirect
    const storedData = sessionStorage.getItem('adsgupta-data-store');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (parsed.state?.uploadedData) {
        navigate('/analysis');
      } else {
        // Retry once if data not found
        await new Promise(r => setTimeout(r, 300));
        navigate('/analysis');
      }
    } else {
      // Fallback redirect
      navigate('/analysis');
    }
    setIsProcessing(false);
  }, [setUploadedData, navigate]);

  // Handle multiple files - process and redirect to Multi-Vault
  const handleMultipleFiles = useCallback(async (files) => {
    clearAllFiles();
    setIsProcessing(true);
    setProcessingStage(`Processing ${files.length} files...`);
    
    // Parse each file and add to store
    for (const file of files) {
      const extension = file.name.split('.').pop().toLowerCase();
      
      try {
        let data, headers;
        
        if (extension === 'csv') {
          const result = await new Promise((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              complete: resolve,
              error: reject
            });
          });
          data = result.data;
          headers = result.meta.fields || [];
        } else if (['xlsx', 'xls'].includes(extension)) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
          headers = data.length > 0 ? Object.keys(data[0]) : [];
        }
        
        const reportType = detectReportType(headers);
        addFile({
          name: file.name,
          type: extension,
          reportType,
          headers,
          data,
          rowCount: data.length,
          uploadedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error parsing file:', file.name, error);
      }
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/multi-vault');
    }, 500);
  }, [addFile, clearAllFiles, detectReportType, navigate]);

  const resetAudit = () => {
    clearData();
    setIsProcessing(false);
    setProcessingStage('');
  };

  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]" />
      
      <Navigation />
      <MobileNav />
      
      {/* Marketplace Context Switcher */}
      <MarketplaceContextSwitcher 
        activeMarketplace={activeMarketplace}
        onMarketplaceChange={setActiveMarketplace}
      />

      <main className="relative pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500"
                />
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white font-['Manrope']">
                    Analyzing Your Data
                  </h2>
                  <motion.p 
                    key={processingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-blue-400"
                  >
                    {processingStage}
                  </motion.p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 max-w-md">
                  {['Negative Ninja', 'ACOS Optimizer', 'Buy Box Analyzer', 'Dayparting Pro', 'Conversion Analyzer'].map((agent, i) => (
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
              </motion.div>
            ) : !isMarketplaceActive ? (
              /* Show Protocol Development State for non-Amazon marketplaces */
              <motion.div
                key="protocol-development"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProtocolDevelopmentState 
                  marketplace={currentMarketplace}
                  onNotifyClick={() => setNotifyModalOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -50 }}
                className="space-y-12"
              >
                {/* Hero */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30"
                  >
                    <Sparkles size={14} className="text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">AI-Powered Analysis</span>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight"
                  >
                    Find Revenue Leaks in{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      30 Seconds
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-lg"
                  >
                    Upload your Amazon report and our 20 AI agents will identify wasted ad spend, 
                    conversion killers, and growth opportunities.
                  </motion.p>
                </div>

                {/* Dropzone */}
                <div className="max-w-2xl mx-auto">
                  <AuditDropzone onFileProcessed={handleFileProcessed} onMultipleFiles={handleMultipleFiles} />
                </div>

                {/* Supported Reports */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  <p className="text-zinc-500 text-sm text-center mb-3">Supported Amazon Report Types:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Search Term Report', 'Business Report', 'Advertising Report', 'Sales & Traffic', 'Inventory Report'].map(report => (
                      <span key={report} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs">
                        {report}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-8 text-zinc-500 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Client-side processing
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Data never leaves your browser
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Instant results
                  </span>
                </motion.div>

                {/* CTA to Demo - Cross-Domain Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-4"
                >
                  <p className="text-zinc-500">Not ready to upload your data?</p>
                  <a
                    href={`${DEMO_DOMAIN}/amazon-audit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition-all group"
                    data-testid="demo-universe-link"
                  >
                    <Sparkles size={16} />
                    See the Full AI Demo Universe
                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-zinc-600 text-xs">
                    Explore with 1,400+ simulated data points • No upload required
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstantAuditPage;
