/**
 * Demo Universe Store - Isolated from real user data
 * Uses a separate storage key to prevent data mixing
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateMockData, generateSKUData, generateDemoSummary } from '../data/mockDataGenerators';

const useDemoStore = create(
  persist(
    (set, get) => ({
      // Current marketplace
      marketplace: 'amazon',
      
      // Data mode (organic/paid/total)
      dataMode: 'total',
      
      // Date range
      dateRange: 90,
      
      // Generated data (cached to avoid regeneration)
      timeSeriesData: null,
      skuData: null,
      summary: null,
      
      // AI Agent interactions
      activeAgent: null,
      agentFindings: {},
      
      // Actions
      setMarketplace: (marketplace) => {
        set({ 
          marketplace,
          timeSeriesData: generateMockData(marketplace, get().dateRange),
          skuData: generateSKUData(marketplace),
          summary: generateDemoSummary(marketplace)
        });
      },
      
      setDataMode: (dataMode) => set({ dataMode }),
      
      setDateRange: (dateRange) => {
        set({ 
          dateRange,
          timeSeriesData: generateMockData(get().marketplace, dateRange)
        });
      },
      
      setActiveAgent: (agentId) => set({ activeAgent: agentId }),
      
      addAgentFinding: (agentId, finding) => {
        const current = get().agentFindings;
        set({
          agentFindings: {
            ...current,
            [agentId]: [...(current[agentId] || []), finding]
          }
        });
      },
      
      // Initialize data if not present
      initializeData: () => {
        const state = get();
        if (!state.timeSeriesData) {
          set({
            timeSeriesData: generateMockData(state.marketplace, state.dateRange),
            skuData: generateSKUData(state.marketplace),
            summary: generateDemoSummary(state.marketplace)
          });
        }
      },
      
      // Clear all demo data
      clearDemoData: () => set({
        timeSeriesData: null,
        skuData: null,
        summary: null,
        agentFindings: {}
      })
    }),
    {
      name: 'adsgupta-demo-store', // SEPARATE from real data store
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        marketplace: state.marketplace,
        dataMode: state.dataMode,
        dateRange: state.dateRange
        // Don't persist generated data - regenerate on load
      })
    }
  )
);

export default useDemoStore;
