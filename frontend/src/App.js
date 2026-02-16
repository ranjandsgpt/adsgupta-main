import "@/App.css";
import { CustomCursor } from "./components/CustomCursor";
import { Navigation } from "./components/Navigation";
import { MobileNav } from "./components/MobileNav";
import { HeroSection } from "./components/HeroSection";
import { StatsTicker } from "./components/StatsTicker";
import { HubSection } from "./components/HubSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { BlogPreview } from "./components/BlogPreview";
import { Footer } from "./components/Footer";

function App() {
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
        <FeaturesSection />
        <BlogPreview />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
