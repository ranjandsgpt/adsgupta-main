import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/aboutme" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/marketplacesolutions" element={<MarketplaceSolutionsPage />} />
        <Route path="/supply" element={<SupplyPage />} />
        <Route path="/demand" element={<DemandPage />} />
        <Route path="/tools" element={<ToolsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
