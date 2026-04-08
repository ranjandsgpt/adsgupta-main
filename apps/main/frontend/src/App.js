import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { Footer } from "@adsgupta/ui";
import { ChatBot } from "./components/ChatBot";

// Pages
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
import NeuralMapPage from "./pages/NeuralMapPage";

// Demo Universe Module (Isolated)
import DemoUniversePage from "./modules/demo-universe/DemoUniversePage";
import DemoShowcaseHub from "./modules/demo-universe/DemoShowcaseHub";
import MonetizationPage from "./modules/demo-universe/MonetizationPage";

// TalentOS Module
import TalentOSLanding from "./modules/talentos/pages/TalentOSLanding";
import TalentOSWorkspace from "./modules/talentos/pages/TalentOSWorkspace";
import TalentOSAnalysis from "./modules/talentos/pages/TalentOSAnalysis";
import TalentOSInterview from "./modules/talentos/pages/TalentOSInterview";

import PersistentSLMChat from './components/PersistentSLMChat';
import OmniNav from './components/OmniNav';

// Environment config
const SHOW_DEMO = process.env.REACT_APP_SHOW_DEMO === 'true';
const SITE_MODE = process.env.REACT_APP_SITE_MODE || 'tools';
const DEMO_DOMAIN = process.env.REACT_APP_DEMO_DOMAIN || 'https://demoai.adsgupta.com';
const TOOLS_DOMAIN = process.env.REACT_APP_TOOLS_DOMAIN || 'https://tools.adsgupta.com';

// Detect if we're on demo domain
const isDemoDomain = typeof window !== 'undefined' && 
  (window.location.hostname.includes('demoai') || SHOW_DEMO);

const MARKETING_SEO_TITLE = 'AdsGupta · AD-OS — The Advertising Intelligence Ecosystem';
const MARKETING_SEO_DESCRIPTION =
  'An open intelligence ecosystem spanning programmatic exchanges, marketplace audits, AI sandboxes, and career tech. Protocols for publishers, sellers, advertisers, and talent.';
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AdsGupta',
  description:
    'AdsGupta is an advertising intelligence ecosystem built by Ranjan Dasgupta and Pousali Dasgupta. The AD-OS platform connects programmatic monetization, marketplace intelligence, AI experimentation, and career acceleration through a shared neural engine — serving publishers, advertisers, marketplace sellers, agencies, and job seekers.',
};

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
        
        {/* 2. The Neural Engine (formerly "The Core") */}
        <FeaturesSection />
        
        {/* 3. The Protocols (formerly "The Hub") */}
        <HubSection />
        
        {/* 4. Blog Preview - MARKETPLACE INTEL REMOVED per task */}
        <BlogPreview />
        
        {/* 5. Network Solutions (The Ecosystem) */}
        <NetworkSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Persistent SLM Chatbot */}
      <PersistentSLMChat />
    </div>
  );
};

function App() {
  const seoTitle = isDemoDomain
    ? 'AdsGupta Tools: Instant Amazon Audit & API Growth Command Center'
    : MARKETING_SEO_TITLE;
  const seoDescription = isDemoDomain
    ? 'Free instant Amazon audit with 20 AI optimization agents. Upload your reports for real-time insights on wasted ad spend, conversion killers, and growth opportunities.'
    : MARKETING_SEO_DESCRIPTION;
  const ogTitle = isDemoDomain ? 'AdsGupta Tools - AI-Powered Amazon Analytics' : MARKETING_SEO_TITLE;
  const ogDesc = isDemoDomain
    ? 'Instant Amazon audit with 20 AI agents. Find revenue leaks in 30 seconds.'
    : MARKETING_SEO_DESCRIPTION;

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* SEO Meta Tags - using title prop for React 19 compatibility */}
        <Helmet
          title={seoTitle}
          meta={[
            { name: 'description', content: seoDescription },
            {
              name: 'keywords',
              content: isDemoDomain
                ? 'Amazon seller tools, PPC optimization, ACOS analyzer, Amazon audit, ecommerce analytics'
                : 'programmatic advertising, ad exchange, marketplace intelligence, AI sandbox, TalentOS, AdsGupta',
            },
            { property: 'og:title', content: ogTitle },
            { property: 'og:description', content: ogDesc },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: ogTitle },
          ]}
        >
          {!isDemoDomain && (
            <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSON_LD)}</script>
          )}
        </Helmet>
        
        <CustomCursor />
        <Routes>
          {/* Demo Domain Routes (demoai.adsgupta.com) - when SHOW_DEMO is true */}
          {isDemoDomain ? (
            <>
              {/* Demo domain root is the Showcase Hub */}
              <Route path="/" element={<DemoShowcaseHub />} />
              <Route path="/amazon-audit" element={<DemoUniversePage />} />
              <Route path="/monetization" element={<MonetizationPage />} />
              <Route path="/internal-demo" element={<DemoUniversePage />} />
              {/* Allow access to tools for comparison */}
              <Route path="/audit" element={<InstantAuditPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/neural-map" element={<NeuralMapPage />} />
            </>
          ) : (
            <>
              {/* Tools Domain Routes (tools.adsgupta.com) */}
              {/* Main Homepage - Marketing Landing */}
              <Route path="/" element={<HomePage />} />
              
              {/* Tools Routes */}
              <Route path="/audit" element={<InstantAuditPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
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
              <Route path="/showcase" element={<DemoShowcaseHub />} />
              <Route path="/monetization" element={<MonetizationPage />} />
              {/* 301 Redirect: /amazon-audit -> demoai.adsgupta.com/amazon-audit */}
              <Route path="/amazon-audit" element={<AmazonAuditRedirect />} />
              {SHOW_DEMO && <Route path="/internal-demo" element={<DemoUniversePage />} />}
              
              {/* Marketing/Landing Pages — /blog redirects to external blog */}
              <Route path="/blog/*" element={<BlogExternalRedirect />} />
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

const BlogExternalRedirect = () => {
  const location = useLocation();
  const suffix = location.pathname.startsWith('/blog')
    ? location.pathname.slice('/blog'.length)
    : '';
  window.location.replace(`https://blog.adsgupta.com${suffix || ''}${location.search}`);
  return null;
};

// Redirect component for /demo route
const DemoRedirect = () => {
  window.location.href = `${DEMO_DOMAIN}/amazon-audit`;
  return null;
};

// 301 Redirect component for /amazon-audit route
const AmazonAuditRedirect = () => {
  // Simulate 301 redirect by replacing current history entry
  window.location.replace(`${DEMO_DOMAIN}/amazon-audit`);
  return null;
};

// Export domain config for use in components
export { DEMO_DOMAIN, TOOLS_DOMAIN, isDemoDomain };

export default App;
