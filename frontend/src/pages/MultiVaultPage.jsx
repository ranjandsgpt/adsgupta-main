/**
 * Multi-Vault Uploader - The Quantum Neural Interface
 * Handles up to 10 files with futuristic processing visualization
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle, Loader2,
  Sparkles, Zap, Database, GitMerge, Brain, ArrowRight, Plus,
  FileText, Trash2, Eye, ChevronRight, Cpu, Network
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import useMultiFileStore, { REPORT_SIGNATURES } from '../store/multiFileStore';

// Report type badges
const REPORT_TYPE_STYLES = {
  business_report: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Business Report' },
  search_term_report: { color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'Search Term' },
  sponsored_products: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Sponsored Products' },
  settlement_report: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Settlement' },
  returns_report: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Returns' },
  inventory_report: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Inventory' },
  fba_fees: { color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'FBA Fees' },
  all_orders: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'All Orders' },
  brand_analytics: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', label: 'Brand Analytics' },
  unknown: { color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: 'Unknown' }
};

// File Card Component
const FileCard = ({ file, onRemove, index }) => {
  const style = REPORT_TYPE_STYLES[file.reportType] || REPORT_TYPE_STYLES.unknown;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="relative group"
    >
      <div className="p-4 rounded-xl bg-[#0A1628] border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
            <FileSpreadsheet size={18} className={style.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{file.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${style.bg} ${style.color}`}>
                {style.label}
              </span>
              <span className="text-zinc-500 text-xs">{file.rowCount?.toLocaleString()} rows</span>
            </div>
          </div>
          <button
            onClick={() => onRemove(file.id)}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Processing Matrix Overlay
const ProcessingMatrix = ({ steps, currentStep, progress }) => {
  const processingStages = [
    { id: 'parse', label: 'Parsing File Structures', icon: FileText },
    { id: 'detect', label: 'Detecting Report Types', icon: Eye },
    { id: 'clean', label: 'Cleaning & Normalizing Data', icon: Database },
    { id: 'merge', label: 'Quantum Merging on SKU/ASIN', icon: GitMerge },
    { id: 'correlate', label: 'Computing Correlations', icon: Network },
    { id: 'analyze', label: 'Running 20 AI Agents', icon: Brain },
    { id: 'insights', label: 'Generating Cross-Pollination Insights', icon: Zap },
    { id: 'map', label: 'Building Neural Map', icon: Cpu }
  ];
  
  const currentIndex = processingStages.findIndex(s => s.id === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#050B18]/95 backdrop-blur-xl z-50 flex items-center justify-center"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F608_1px,transparent_1px),linear-gradient(to_bottom,#3B82F608_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/50 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative max-w-2xl w-full mx-6">
        {/* Main processing visual */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-500 border-l-purple-500 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={32} className="text-blue-400" />
            </div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white font-['Manrope'] mb-2">
            Quantum Processing
          </h2>
          <p className="text-zinc-400">
            Neural engine stitching your data streams...
          </p>
        </div>

        {/* Progress stages */}
        <div className="space-y-3 mb-8">
          {processingStages.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isCurrent ? 'bg-blue-500/10 border border-blue-500/30' : 
                  isComplete ? 'bg-emerald-500/5 border border-emerald-500/20' : 
                  'bg-white/5 border border-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-blue-500/20' : 'bg-white/10'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isCurrent ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={16} className="text-blue-400" />
                    </motion.div>
                  ) : (
                    <stage.icon size={16} className="text-zinc-500" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isComplete ? 'text-emerald-400' : isCurrent ? 'text-blue-400' : 'text-zinc-500'
                }`}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-auto text-blue-400 text-xs font-mono"
                  >
                    {progress}%
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Data flow visualization */}
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Main Multi-Vault Page
const MultiVaultPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  
  const { 
    files, 
    addFile, 
    removeFile, 
    clearAllFiles,
    detectReportType,
    setProcessingState,
    getReportTypesSummary
  } = useMultiFileStore();

  // Parse single file
  const parseFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            const reportType = detectReportType(headers);
            resolve({
              name: file.name,
              type: 'csv',
              reportType,
              headers,
              data: results.data,
              rowCount: results.data.length
            });
          },
          error: reject
        });
      } else if (['xlsx', 'xls'].includes(extension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
          const reportType = detectReportType(headers);
          
          resolve({
            name: file.name,
            type: 'xlsx',
            reportType,
            headers,
            data: jsonData,
            rowCount: jsonData.length
          });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }, [detectReportType]);

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    for (const file of fileArray) {
      if (files.length >= 10) {
        alert('Maximum 10 files allowed');
        break;
      }
      
      try {
        const parsed = await parseFile(file);
        addFile({ ...parsed, uploadedAt: new Date().toISOString() });
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  }, [files.length, parseFile, addFile]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Process all files
  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    const steps = ['parse', 'detect', 'clean', 'merge', 'correlate', 'analyze', 'insights', 'map'];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      for (let p = 0; p <= 100; p += 10) {
        setProgress(Math.round((i * 100 + p) / steps.length));
        await new Promise(r => setTimeout(r, 80));
      }
    }
    
    setProgress(100);
    await new Promise(r => setTimeout(r, 500));
    
    setIsProcessing(false);
    navigate('/neural-map');
  };

  const reportSummary = getReportTypesSummary();
  const totalRows = files.reduce((sum, f) => sum + (f.rowCount || 0), 0);

  // Cross-pollination possibilities
  const crossPollinations = [
    { 
      id: 'trueProfitAudit', 
      name: 'True Profit Audit', 
      requires: ['Business Report', 'Settlement'],
      available: reportSummary.business_report && reportSummary.settlement_report
    },
    { 
      id: 'ppcCannibalization', 
      name: 'PPC Cannibalization', 
      requires: ['Business Report', 'PPC/Search Term'],
      available: reportSummary.business_report && (reportSummary.sponsored_products || reportSummary.search_term_report)
    },
    { 
      id: 'inventoryAdVelocity', 
      name: 'Inventory-Ad Velocity', 
      requires: ['Inventory', 'PPC Report'],
      available: reportSummary.inventory_report && (reportSummary.sponsored_products || reportSummary.search_term_report)
    },
    { 
      id: 'roasLeak', 
      name: 'ROAS Leak / Waste Map', 
      requires: ['Search Term', 'Returns'],
      available: reportSummary.search_term_report && reportSummary.returns_report
    }
  ];

  return (
    <div className="min-h-screen bg-[#050B18] relative">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <Navigation />
      <MobileNav />

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <ProcessingMatrix steps={[]} currentStep={currentStep} progress={progress} />
        )}
      </AnimatePresence>

      <main className="relative pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border border-white/10 mb-4"
            >
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 text-sm font-medium">
                Multi-File Cross-Pollination Engine
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white font-['Manrope'] tracking-tight mb-4"
            >
              The Quantum{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400">
                Multi-Vault
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
              Upload up to 10 Amazon reports. Our neural engine will merge, correlate, and reveal 
              insights that would take 50 analysts a month to uncover.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Zone */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dropzone */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50" />
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/10 bg-[#0A1628]/80 hover:border-white/20 hover:bg-[#0A1628]'
                    }`}
                  data-testid="multi-vault-dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4"
                  >
                    <Upload size={28} className="text-blue-400" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white font-['Manrope'] mb-2">
                    Drop Your Amazon Reports
                  </h3>
                  <p className="text-zinc-400 mb-4">
                    Up to <span className="text-blue-400 font-semibold">10 files</span> • CSV or XLSX
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Business', 'Search Term', 'Settlement', 'Returns', 'Inventory', 'FBA Fees'].map(type => (
                      <span key={type} className="px-2 py-1 rounded bg-white/5 text-zinc-500 text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Uploaded Files Grid */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Database size={18} className="text-blue-400" />
                      Uploaded Files ({files.length}/10)
                    </h3>
                    <button
                      onClick={clearAllFiles}
                      className="text-zinc-500 text-sm hover:text-red-400 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <FileCard 
                          key={file.id} 
                          file={file} 
                          onRemove={removeFile}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-zinc-500">
                      Total: <span className="text-white font-semibold">{totalRows.toLocaleString()}</span> rows
                    </span>
                    <span className="text-zinc-500">
                      Report Types: <span className="text-white font-semibold">{Object.keys(reportSummary).length}</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Cross-Pollination Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-[#0A1628] border border-white/5"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GitMerge size={18} className="text-violet-400" />
                  Cross-Pollination Insights
                </h3>
                
                <div className="space-y-3">
                  {crossPollinations.map(cp => (
                    <div 
                      key={cp.id}
                      className={`p-3 rounded-xl border transition-all ${
                        cp.available 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {cp.available ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : (
                          <AlertTriangle size={14} className="text-zinc-500" />
                        )}
                        <span className={`text-sm font-medium ${cp.available ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {cp.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 ml-6">
                        Requires: {cp.requires.join(' + ')}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Process Button */}
              {files.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processFiles}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 text-white font-bold 
                    shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all
                    flex items-center justify-center gap-3"
                  data-testid="process-files-btn"
                >
                  <Zap size={20} />
                  Begin Quantum Analysis
                  <ChevronRight size={20} />
                </motion.button>
              )}

              {/* Trust indicators */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  All processing happens in your browser
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Zero hallucination - every insight is traceable
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Data never leaves your device
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

export default MultiVaultPage;
