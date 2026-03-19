/**
 * Global Data Store using Zustand
 * Uses a hybrid approach:
 * - Large data (uploadedData, parsedData rows) stays in memory only
 * - Small data (summary, metadata) persists to sessionStorage
 * This prevents "quota exceeded" errors for large files
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Free audit limit
const FREE_AUDIT_LIMIT = 3;

// Maximum rows to persist (to stay under sessionStorage limit)
const MAX_PERSIST_ROWS = 500;

const useDataStore = create(
  persist(
    (set, get) => ({
      // Uploaded file data (stored in memory, NOT persisted for large files)
      uploadedData: null,
      fileName: null,
      fileType: null,
      reportType: null,
      uploadedAt: null,
      rowCount: 0,
      
      // Parsed and analyzed data
      parsedData: null,
      agentResults: null,
      analysisComplete: false,
      
      // Audit counter
      auditCount: 0,
      freeAuditsRemaining: FREE_AUDIT_LIMIT,
      
      // Pro status (for paywall)
      isPro: false,
      
      // Actions
      setUploadedData: (data, fileName, fileType, reportType = 'search_term') => {
        const rowCount = Array.isArray(data) ? data.length : 0;
        console.log(`Storing ${rowCount} rows (large file mode: ${rowCount > MAX_PERSIST_ROWS})`);
        
        set({
          uploadedData: data,
          fileName,
          fileType,
          reportType,
          rowCount,
          uploadedAt: new Date().toISOString(),
          analysisComplete: false,
          agentResults: null,
          parsedData: null
        });
      },
      
      setParsedData: (parsedData) => set({ parsedData }),
      
      setAgentResults: (agentResults) => set({ 
        agentResults,
        analysisComplete: true
      }),
      
      incrementAuditCount: () => {
        const current = get().auditCount;
        const newCount = current + 1;
        set({
          auditCount: newCount,
          freeAuditsRemaining: Math.max(0, FREE_AUDIT_LIMIT - newCount)
        });
      },
      
      resetAuditCount: () => set({
        auditCount: 0,
        freeAuditsRemaining: FREE_AUDIT_LIMIT
      }),
      
      setPro: (isPro) => set({ isPro }),
      
      clearData: () => set({
        uploadedData: null,
        fileName: null,
        fileType: null,
        reportType: null,
        uploadedAt: null,
        rowCount: 0,
        parsedData: null,
        agentResults: null,
        analysisComplete: false
      }),
      
      // Get summary metrics (returns N/A for missing data)
      getSafeMetric: (metricPath, defaultValue = 'N/A') => {
        const state = get();
        if (!state.parsedData?.summary) return defaultValue;
        
        const value = metricPath.split('.').reduce(
          (obj, key) => obj?.[key],
          state.parsedData.summary
        );
        
        if (value === undefined || value === null || value === 0) {
          return defaultValue;
        }
        return value;
      },
      
      // Check if metric exists in data
      hasMetric: (metricName) => {
        const state = get();
        if (!state.parsedData?.rows?.[0]) return false;
        return state.parsedData.rows[0][metricName] !== undefined;
      }
    }),
    {
      name: 'adsgupta-data-store',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist essential data, not full dataset
      partialize: (state) => {
        const isLargeFile = (state.rowCount || 0) > MAX_PERSIST_ROWS;
        
        // For large files, only persist metadata and summary
        // The analysis will need to be re-run if page is refreshed
        return {
          // Always persist metadata
          fileName: state.fileName,
          fileType: state.fileType,
          reportType: state.reportType,
          uploadedAt: state.uploadedAt,
          rowCount: state.rowCount,
          auditCount: state.auditCount,
          freeAuditsRemaining: state.freeAuditsRemaining,
          isPro: state.isPro,
          analysisComplete: state.analysisComplete,
          
          // For small files, persist everything
          // For large files, only persist summary data
          uploadedData: isLargeFile ? null : state.uploadedData,
          parsedData: isLargeFile ? (state.parsedData ? {
            summary: state.parsedData.summary,
            wastedSpend: state.parsedData.wastedSpend,
            availableMetrics: state.parsedData.availableMetrics,
            missingMetrics: state.parsedData.missingMetrics,
            reportType: state.parsedData.reportType,
            totalRows: state.parsedData.totalRows,
            columns: state.parsedData.columns,
            // Keep top items only
            asins: state.parsedData.asins?.slice(0, 50),
            searchTerms: state.parsedData.searchTerms?.slice(0, 100),
            rows: state.parsedData.rows?.slice(0, 100) // Sample rows for display
          } : null) : state.parsedData,
          agentResults: state.agentResults
        };
      }
    }
  )
);

export default useDataStore;
