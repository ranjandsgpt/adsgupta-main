import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DemoAIHeader } from './components/DemoAIHeader';
import { DemoBottomNav } from './components/DemoTabNav';
import { Footer } from './components/Footer';
import { documentTitleFromPath } from './config/demoRoutes';
import { MonetizationLab } from './pages/MonetizationLab';
import { AILab } from './pages/AILab';
import { CreativeTemplateLab } from './pages/CreativeTemplateLab';
import { GamesLab } from './pages/GamesLab';

function AppShell() {
  const location = useLocation();
  const [toolSearchQuery, setToolSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.title = documentTitleFromPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0A0A0A] text-zinc-200 flex flex-col overflow-x-hidden demo-app-shell">
      <DemoAIHeader
        toolSearchQuery={toolSearchQuery}
        setToolSearchQuery={setToolSearchQuery}
        placeholder="Search tools by name or type..."
      />
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/monetizationlab" replace />} />
          <Route path="/monetizationlab" element={<MonetizationLab />} />
          <Route path="/ailab" element={<AILab toolSearchQuery={toolSearchQuery} />} />
          <Route path="/creatives" element={<CreativeTemplateLab />} />
          <Route path="/games" element={<GamesLab />} />
          <Route path="*" element={<Navigate to="/monetizationlab" replace />} />
        </Routes>
      </div>
      <Footer />
      <DemoBottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
