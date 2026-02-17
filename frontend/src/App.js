import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { CustomCursor } from "./components/CustomCursor";
import { Navigation } from "./components/Navigation";
import { MobileNav } from "./components/MobileNav";
import { HeroSection } from "./components/HeroSection";
import { StatsTicker } from "./components/StatsTicker";
import { FeaturesSection } from "./components/FeaturesSection";
import { HubSection } from "./components/HubSection";
import { MarketplaceSection } from "./components/MarketplaceSection";
import { NetworkSection } from "./components/NetworkSection";
import { BlogPreview } from "./components/BlogPreview";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";

// Pages
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import MarketplaceSolutionsPage from "./pages/MarketplaceSolutionsPage";
import SupplyPage from "./pages/SupplyPage";
import DemandPage from "./pages/DemandPage";
import ToolsPage from "./pages/ToolsPage";
import DashboardPage from "./pages/DashboardPage";
import InstantAuditPage from "./pages/InstantAuditPage";
import AnalysisPage from "./pages/AnalysisPage";
import MultiVaultPage from "./pages/MultiVaultPage";
import NeuralMapPage from "./pages/NeuralMapPage";

// Demo Universe Module (Isolated)
import DemoUniversePage from "./modules/demo-universe/DemoUniversePage";

// TalentOS Module
import TalentOSLanding from "./modules/talentos/pages/TalentOSLanding";
import TalentOSWorkspace from "./modules/talentos/pages/TalentOSWorkspace";
import TalentOSAnalysis from "./modules/talentos/pages/TalentOSAnalysis";
import TalentOSInterview from "./modules/talentos/pages/TalentOSInterview";

// Environment config
const SHOW_DEMO = process.env.REACT_APP_SHOW_DEMO === 'true';
const SITE_MODE = process.env.REACT_APP_SITE_MODE || 'tools';
const DEMO_DOMAIN = process.env.REACT_APP_DEMO_DOMAIN || 'https://demoai.adsgupta.com';
const TOOLS_DOMAIN = process.env.REACT_APP_TOOLS_DOMAIN || 'https://tools.adsgupta.com';

// Detect if we're on demo domain
const isDemoDomain = typeof window !== 'undefined' && 
  (window.location.hostname.includes('demoai') || SHOW_DEMO);

// Home Page Component - Reordered for Narrative Flow
const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Navigation */}
      <Navigation />
      <MobileNav />
      
      {/* Main Content - Narrative Order */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection />
        
        {/* Stats Ticker */}
        <StatsTicker />
        
        {/* 2. The Neural Engine (The Core) - Moved Up */}
        <FeaturesSection />
        
        {/* 3. The Hub (The Protocols) */}
        <HubSection />
        
        {/* 4. Marketplace Solutions (Feature Deep-Dive) */}
        <MarketplaceSection />
        
        {/* 5. Blog Preview */}
        <BlogPreview />
        
        {/* 6. Network Solutions (The Ecosystem) - Moved to Bottom */}
        <NetworkSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

function App() {
  // Static SEO values for tools domain (demo domain will have its own build)
  const seoTitle = "AdsGupta Tools: Instant Amazon Audit & API Growth Command Center";
  const seoDescription = "Free instant Amazon audit with 20 AI optimization agents. Upload your reports for real-time insights on wasted ad spend, conversion killers, and growth opportunities.";
  const ogTitle = "AdsGupta Tools - AI-Powered Amazon Analytics";
  const ogDesc = "Instant Amazon audit with 20 AI agents. Find revenue leaks in 30 seconds.";

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* SEO Meta Tags - using title prop for React 19 compatibility */}
        <Helmet
          title={seoTitle}
          meta={[
            { name: "description", content: seoDescription },
            { name: "keywords", content: "Amazon seller tools, PPC optimization, ACOS analyzer, Amazon audit, ecommerce analytics" },
            { property: "og:title", content: ogTitle },
            { property: "og:description", content: ogDesc },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: ogTitle }
          ]}
        />
        
        <CustomCursor />
        <Routes>
          {/* Demo Domain Routes (demoai.adsgupta.com) - when SHOW_DEMO is true */}
          {isDemoDomain ? (
            <>
              {/* Demo domain defaults to Demo Universe */}
              <Route path="/" element={<Navigate to="/amazon-audit" replace />} />
              <Route path="/amazon-audit" element={<DemoUniversePage />} />
              <Route path="/internal-demo" element={<DemoUniversePage />} />
              {/* Allow access to tools for comparison */}
              <Route path="/audit" element={<InstantAuditPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/multi-vault" element={<MultiVaultPage />} />
              <Route path="/neural-map" element={<NeuralMapPage />} />
            </>
          ) : (
            <>
              {/* Tools Domain Routes (tools.adsgupta.com) */}
              {/* Main Homepage - Marketing Landing */}
              <Route path="/" element={<HomePage />} />
              
              {/* Tools Routes - Multi-File Instant Audit is default */}
              <Route path="/audit" element={<InstantAuditPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/multi-vault" element={<MultiVaultPage />} />
              <Route path="/neural-map" element={<NeuralMapPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* TalentOS Routes */}
              <Route path="/talentos" element={<TalentOSLanding />} />
              <Route path="/talentos/workspace" element={<TalentOSWorkspace />} />
              <Route path="/talentos/analysis" element={<TalentOSAnalysis />} />
              <Route path="/talentos/interview" element={<TalentOSInterview />} />
              <Route path="/talentos/login" element={<TalentOSLanding />} />
              
              {/* Demo Universe - Redirect to demoai domain */}
              <Route path="/demo" element={<DemoRedirect />} />
              {SHOW_DEMO && <Route path="/internal-demo" element={<DemoUniversePage />} />}
              
              {/* Marketing/Landing Pages */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/aboutme" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/marketplacesolutions" element={<MarketplaceSolutionsPage />} />
              <Route path="/supply" element={<SupplyPage />} />
              <Route path="/demand" element={<DemandPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/lab" element={<ToolsPage />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

// Redirect component for /demo route
const DemoRedirect = () => {
  window.location.href = `${DEMO_DOMAIN}/amazon-audit`;
  return null;
};

// Export domain config for use in components
export { DEMO_DOMAIN, TOOLS_DOMAIN, isDemoDomain };

export default App;
