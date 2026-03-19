import { useState, useEffect } from 'react';
import { DemoAIHeader } from './components/DemoAIHeader';
import { Footer } from './components/Footer';
import { MonetizationLab } from './pages/MonetizationLab';
import { AILab } from './pages/AILab';
import { CreativeTemplateLab } from './pages/CreativeTemplateLab';
import { GamesLab } from './pages/GamesLab';

function App() {
  const [activeTab, setActiveTab] = useState('monetization');
  const [toolSearchQuery, setToolSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-200 flex flex-col">
      <DemoAIHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toolSearchQuery={toolSearchQuery}
        setToolSearchQuery={setToolSearchQuery}
        placeholder="Search tools by name or type..."
      />
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'monetization' && <MonetizationLab toolSearchQuery={toolSearchQuery} />}
        {activeTab === 'ai-lab' && <AILab toolSearchQuery={toolSearchQuery} />}
        {activeTab === 'creative-template' && <CreativeTemplateLab />}
        {activeTab === 'games' && <GamesLab />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
