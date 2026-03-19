/**
 * Global Data Store using Zustand
 * Persists uploaded data across routes without server storage
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Free audit limit
const FREE_AUDIT_LIMIT = 3;

const useDataStore = create(
  persist(
    (set, get) => ({
      // Uploaded file data
      uploadedData: null,
      fileName: null,
      fileType: null,
      uploadedAt: null,
      
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
      setUploadedData: (data, fileName, fileType) => set({
        uploadedData: data,
        fileName,
        fileType,
        uploadedAt: new Date().toISOString(),
        analysisComplete: false,
        agentResults: null
      }),
      
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
        uploadedAt: null,
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
      partialize: (state) => ({
        uploadedData: state.uploadedData,
        fileName: state.fileName,
        fileType: state.fileType,
        uploadedAt: state.uploadedAt,
        parsedData: state.parsedData,
        agentResults: state.agentResults,
        analysisComplete: state.analysisComplete,
        auditCount: state.auditCount,
        freeAuditsRemaining: state.freeAuditsRemaining,
        isPro: state.isPro
      })
    }
  )
);

export default useDataStore;
