/**
 * Multi-File Data Store - The Quantum Vault
 * Handles up to 10 files with cross-pollination correlation
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Report type detection patterns
const REPORT_SIGNATURES = {
  business_report: ['ordered_product_sales', 'sessions', 'page_views', 'buy_box_percentage'],
  search_term_report: ['customer_search_term', 'impressions', 'clicks', 'spend', '7_day_total_sales'],
  sponsored_products: ['campaign_name', 'ad_group_name', 'impressions', 'clicks', 'spend'],
  settlement_report: ['settlement_id', 'transaction_type', 'amount_description', 'total'],
  returns_report: ['return_date', 'return_reason', 'asin', 'sku'],
  inventory_report: ['asin', 'fnsku', 'available', 'inbound_working', 'reserved'],
  fba_fees: ['asin', 'fulfillment_fee', 'storage_fee', 'long_term_storage_fee'],
  all_orders: ['amazon_order_id', 'purchase_date', 'order_status', 'item_price'],
  brand_analytics: ['search_term', 'search_frequency_rank', 'click_share', 'conversion_share'],
  voice_of_customer: ['asin', 'negative_customer_experience', 'listing_defects']
};

// Joinable key fields
const JOIN_KEYS = ['asin', 'sku', 'seller_sku', 'fnsku', 'parent_asin', 'child_asin'];

const useMultiFileStore = create(
  persist(
    (set, get) => ({
      // Multi-file vault
      files: [], // Array of { id, name, type, reportType, data, headers, rowCount, uploadedAt }
      
      // Processing state
      processingState: {
        isProcessing: false,
        currentStep: '',
        progress: 0,
        steps: []
      },
      
      // Merged master data
      masterData: null,
      joinedRecords: 0,
      correlations: [],
      
      // Cross-pollination insights
      crossInsights: {
        trueProfitAudit: null,
        ppcCannibalization: null,
        inventoryAdVelocity: null,
        roasLeak: null,
        profitDecay: null,
        elasticityEngine: null,
        wasteMap: null
      },
      
      // Neural map data
      neuralMapData: {
        nodes: [],
        edges: [],
        clusters: []
      },
      
      // Simulation results
      simulationResults: null,
      goldenPath: null,
      
      // Lead capture
      leadEmail: null,
      
      // Actions
      addFile: (file) => {
        const files = get().files;
        if (files.length >= 10) {
          console.warn('Maximum 10 files allowed');
          return false;
        }
        set({ files: [...files, { ...file, id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}` }] });
        return true;
      },
      
      removeFile: (fileId) => {
        set({ files: get().files.filter(f => f.id !== fileId) });
      },
      
      clearAllFiles: () => {
        set({ 
          files: [], 
          masterData: null, 
          correlations: [],
          crossInsights: {
            trueProfitAudit: null,
            ppcCannibalization: null,
            inventoryAdVelocity: null,
            roasLeak: null,
            profitDecay: null,
            elasticityEngine: null,
            wasteMap: null
          },
          neuralMapData: { nodes: [], edges: [], clusters: [] },
          simulationResults: null,
          goldenPath: null
        });
      },
      
      setProcessingState: (state) => {
        set({ processingState: { ...get().processingState, ...state } });
      },
      
      updateProcessingStep: (step, progress) => {
        const current = get().processingState;
        set({ 
          processingState: { 
            ...current, 
            currentStep: step, 
            progress,
            steps: [...current.steps, { step, timestamp: Date.now() }]
          } 
        });
      },
      
      setMasterData: (data) => set({ masterData: data }),
      
      setJoinedRecords: (count) => set({ joinedRecords: count }),
      
      setCorrelations: (correlations) => set({ correlations }),
      
      setCrossInsight: (insightKey, data) => {
        const current = get().crossInsights;
        set({ crossInsights: { ...current, [insightKey]: data } });
      },
      
      setNeuralMapData: (data) => set({ neuralMapData: data }),
      
      setSimulationResults: (results) => set({ simulationResults: results }),
      
      setGoldenPath: (path) => set({ goldenPath: path }),
      
      setLeadEmail: (email) => set({ leadEmail: email }),
      
      // Detect report type from headers
      detectReportType: (headers) => {
        const normalizedHeaders = headers.map(h => h?.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        
        for (const [reportType, signatures] of Object.entries(REPORT_SIGNATURES)) {
          const matchCount = signatures.filter(sig => 
            normalizedHeaders.some(h => h?.includes(sig.replace(/[^a-z0-9]/g, '_')))
          ).length;
          
          if (matchCount >= 2) {
            return reportType;
          }
        }
        return 'unknown';
      },
      
      // Get all available metrics across all files
      getAllMetrics: () => {
        const files = get().files;
        const metricsSet = new Set();
        
        files.forEach(file => {
          if (file.headers) {
            file.headers.forEach(h => metricsSet.add(h));
          }
        });
        
        return Array.from(metricsSet);
      },
      
      // Get report types summary
      getReportTypesSummary: () => {
        const files = get().files;
        const summary = {};
        
        files.forEach(file => {
          const type = file.reportType || 'unknown';
          if (!summary[type]) {
            summary[type] = { count: 0, files: [], totalRows: 0 };
          }
          summary[type].count++;
          summary[type].files.push(file.name);
          summary[type].totalRows += file.rowCount || 0;
        });
        
        return summary;
      },
      
      // Check if specific cross-pollination is possible
      canRunCrossPollination: (insightType) => {
        const summary = get().getReportTypesSummary();
        
        switch (insightType) {
          case 'trueProfitAudit':
            return summary.business_report && summary.settlement_report;
          case 'ppcCannibalization':
            return (summary.sponsored_products || summary.search_term_report) && summary.business_report;
          case 'inventoryAdVelocity':
            return (summary.sponsored_products || summary.search_term_report) && summary.inventory_report;
          case 'roasLeak':
            return (summary.sponsored_products || summary.search_term_report) && summary.returns_report;
          case 'wasteMap':
            return summary.search_term_report && summary.returns_report;
          default:
            return false;
        }
      }
    }),
    {
      name: 'adsgupta-multivault-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        files: state.files.map(f => ({ ...f, data: f.data?.slice(0, 100) })), // Limit stored data
        masterData: state.masterData ? { summary: state.masterData.summary } : null,
        crossInsights: state.crossInsights,
        neuralMapData: state.neuralMapData,
        goldenPath: state.goldenPath,
        leadEmail: state.leadEmail
      })
    }
  )
);

export { REPORT_SIGNATURES, JOIN_KEYS };
export default useMultiFileStore;
