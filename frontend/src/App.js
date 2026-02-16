import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CustomCursor } from "./components/CustomCursor";
import { Navigation } from "./components/Navigation";
import { MobileNav } from "./components/MobileNav";
import { HeroSection } from "./components/HeroSection";
import { StatsTicker } from "./components/StatsTicker";
import { HubSection } from "./components/HubSection";
import { CommerceIntelSection } from "./components/CommerceIntelSection";
import { MultiStakeholderGrid } from "./components/MultiStakeholderGrid";
import { StakeholderSection } from "./components/StakeholderSection";
import { FeaturesSection } from "./components/FeaturesSection";
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

// Home Page Component
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
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <StatsTicker />
        <HubSection />
        <CommerceIntelSection />
        <MultiStakeholderGrid />
        <StakeholderSection />
        <FeaturesSection />
        <BlogPreview />
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
