import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import DemoPage from "./pages/DemoPage";
import AnalysisPage from "./pages/AnalysisPage";
import MultiVaultPage from "./pages/MultiVaultPage";
import NeuralMapPage from "./pages/NeuralMapPage";

// Demo Universe Module (Isolated)
import DemoUniversePage from "./modules/demo-universe/DemoUniversePage";

// Environment config
const SHOW_DEMO = process.env.REACT_APP_SHOW_DEMO === 'true';
const SITE_MODE = process.env.REACT_APP_SITE_MODE || 'tools';

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
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* SEO Meta Tags for tools.adsgupta.com */}
        <Helmet>
          <title>AdsGupta Tools: Instant Amazon Audit & API Growth Command Center</title>
          <meta name="description" content="Free instant Amazon audit with 20 AI optimization agents. Upload your reports for real-time insights on wasted ad spend, conversion killers, and growth opportunities." />
          <meta name="keywords" content="Amazon seller tools, PPC optimization, ACOS analyzer, Amazon audit, ecommerce analytics" />
          <meta property="og:title" content="AdsGupta Tools - AI-Powered Amazon Analytics" />
          <meta property="og:description" content="Instant Amazon audit with 20 AI agents. Find revenue leaks in 30 seconds." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="AdsGupta Tools - AI Amazon Audit" />
        </Helmet>
        
        <CustomCursor />
        <Routes>
          {/* Main Homepage - Marketing Landing */}
          <Route path="/" element={<HomePage />} />
          
          {/* Tools Routes */}
          <Route path="/audit" element={<InstantAuditPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/multi-vault" element={<MultiVaultPage />} />
          <Route path="/neural-map" element={<NeuralMapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Demo Universe - Hidden internal route */}
          {SHOW_DEMO && <Route path="/internal-demo" element={<DemoUniversePage />} />}
          <Route path="/demo" element={<DemoPage />} />
          
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
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
