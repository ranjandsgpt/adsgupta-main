import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Home, BarChart3, Play, Pause, RefreshCw, Upload, Download, Settings, CreditCard,
  ShieldCheck, Zap, Layers, TrendingUp, ShoppingCart, DollarSign, Wand2, Plus, Briefcase,
  Eye, Bot, Anchor, Globe, Terminal, Database, Key, CheckCircle2, MessageSquare,
  FileText, Image, LayoutDashboard, Video, Lock, User
} from 'lucide-react';

const THEME_CLASSES = [
  { bg: 'from-cyan-500/10 to-slate-900', border: 'border-cyan-500/20', text: 'text-cyan-400', labelBg: 'bg-cyan-500/10' },
  { bg: 'from-violet-500/10 to-slate-900', border: 'border-violet-500/20', text: 'text-violet-400', labelBg: 'bg-violet-500/10' },
  { bg: 'from-amber-500/10 to-slate-900', border: 'border-amber-500/20', text: 'text-amber-400', labelBg: 'bg-amber-500/10' },
  { bg: 'from-emerald-500/10 to-slate-900', border: 'border-emerald-500/20', text: 'text-emerald-400', labelBg: 'bg-emerald-500/10' },
  { bg: 'from-rose-500/10 to-slate-900', border: 'border-rose-500/20', text: 'text-rose-400', labelBg: 'bg-rose-500/10' },
  { bg: 'from-blue-500/10 to-slate-900', border: 'border-blue-500/20', text: 'text-blue-400', labelBg: 'bg-blue-500/10' },
  { bg: 'from-fuchsia-500/10 to-slate-900', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', labelBg: 'bg-fuchsia-500/10' },
  { bg: 'from-orange-500/10 to-slate-900', border: 'border-orange-500/20', text: 'text-orange-400', labelBg: 'bg-orange-500/10' },
];
function getTheme(i) {
  return THEME_CLASSES[i % THEME_CLASSES.length];
}

const APPS_LIST = [
  { id: 'arena', name: 'AI Arena v2', icon: Cpu, description: 'Watcher-governed adversarial simulation. Two AI players, one watcher AI. Intervene anytime.', themeIndex: 0 },
  { id: 'escrow', name: 'Nexus Escrow', icon: Anchor, description: 'Instant settlement & branded virtual cards. Hold funds until both parties complete.', themeIndex: 1 },
  { id: 'statesnap', name: 'State-Snap Pro', icon: Terminal, description: 'Environment snapshots & compute-on-demand. Save and restore workspace state.', themeIndex: 2 },
  { id: 'audit', name: 'Audit Engine', icon: ShieldCheck, description: 'SSO logs & legally vetted compliance templates. HIPAA, GDPR, SOC2.', themeIndex: 3 },
  { id: 'seats', name: 'Flow-Seat Manager', icon: Zap, description: 'Manage concurrent automation seats & HITL credits. Configure agent capacity.', themeIndex: 4 },
  { id: 'vision', name: 'Vision OS', icon: Home, description: 'AI-to-Print interior redesign. Upload a room photo, get redesign suggestions.', themeIndex: 5 },
  { id: 'mint', name: 'The Mint', icon: Key, description: 'Verified creator badges & in-app currency exchange. Identity and reach.', themeIndex: 6 },
  { id: 'reports', name: 'DataPulse', icon: BarChart3, description: 'Daily repo-synced automation dashboards. Repo intelligence & cold storage.', themeIndex: 7 },
  { id: 'chatbot-studio', name: 'Chatbot Studio', icon: MessageSquare, description: 'Pick finance, weather, or shopping bots. Chat with specialized AI agents.', themeIndex: 0 },
  { id: 'intent-orchestrator', name: 'Intent Orchestrator', icon: Bot, description: 'Route user intent across agents. Multi-agent coordination.', themeIndex: 1 },
  { id: 'trigger-hub', name: 'Trigger Automation Hub', icon: Zap, description: 'Pay-per-trigger automation. Price drop alerts, workflow triggers.', themeIndex: 2 },
  { id: 'hitl-credits', name: 'HITL Credit Manager', icon: User, description: 'Human-in-the-loop credits. Human-verified AI output.', themeIndex: 3 },
  { id: 'virtual-card', name: 'Virtual Card Issuer', icon: CreditCard, description: 'Issue session-based virtual cards. Branded spending controls.', themeIndex: 4 },
  { id: 'micro-insurance', name: 'Micro-Insurance Hub', icon: ShieldCheck, description: 'Per-session insurance. e.g. $1 flight insurance for drone app.', themeIndex: 5 },
  { id: 'settlement-gateway', name: 'Instant Settlement Gateway', icon: DollarSign, description: 'Express fee for instant payouts. Skip 3–5 day holds.', themeIndex: 6 },
  { id: 'bnpl', name: 'BNPL Connector', icon: CreditCard, description: 'Installment payments on digital goods. Partner integration.', themeIndex: 7 },
  { id: 'cold-storage', name: 'Cold Storage Vault', icon: Database, description: 'Low-cost tier for rarely accessed data. Pay when accessed after 30 days.', themeIndex: 0 },
  { id: 'compute-demand', name: 'Compute-on-Demand', icon: Cpu, description: 'Charge by CPU/RAM usage. Dev tools & heavy processing.', themeIndex: 1 },
  { id: 'api-overage', name: 'API Overage Guard', icon: Lock, description: 'Charge after free daily request limit. Power-user and developer tiers.', themeIndex: 2 },
  { id: 'custom-domain', name: 'Custom Domain Manager', icon: Globe, description: 'Connect your .com to link-in-bio or portfolio. Pro hosting.', themeIndex: 3 },
  { id: 'env-snapshot', name: 'Environment Snapshot', icon: Terminal, description: 'Save workspace state. Restore configs instantly.', themeIndex: 4 },
  { id: 'export-credits', name: 'Export Credits', icon: Download, description: 'Heavy lifting: 4K render, batch PDF. Credit-based processing.', themeIndex: 5 },
  { id: 'plugin-market', name: 'Plugin Marketplace', icon: Layers, description: 'Third-party add-ons. Platform takes a cut of developer sales.', themeIndex: 6 },
  { id: 'vision-os', name: 'Interior Design Studio', icon: Home, description: 'Upload room photos. AI redesign and one-click print/canvas.', themeIndex: 7 },
  { id: 'asset-generator', name: 'Asset Generator', icon: Wand2, description: 'AI-generated skins, avatars, templates. Sell in-app.', themeIndex: 0 },
  { id: 'prompt-library', name: 'Prompt Library Pro', icon: FileText, description: 'Tuned proprietary prompts. Prompt-as-a-Service.', themeIndex: 1 },
  { id: 'dashboard-builder', name: 'Dashboard Builder', icon: LayoutDashboard, description: 'Build dashboards from your requirements. Connect data sources.', themeIndex: 2 },
  { id: 'shoppable-video', name: 'Shoppable Video Studio', icon: Video, description: 'Embed checkout links in in-app video. Affiliate commerce.', themeIndex: 3 },
  { id: 'template-unlock', name: 'Template Unlock', icon: FileText, description: 'One-time purchase for UI/document templates. Unlockable content.', themeIndex: 4 },
  { id: 'compliance-hub', name: 'Compliance Template Hub', icon: ShieldCheck, description: 'Pre-filled GDPR, ToS, industry templates. Legally vetted.', themeIndex: 5 },
  { id: 'sso-gateway', name: 'SSO Gateway', icon: Lock, description: 'Okta/Azure integration. Enterprise SSO upsell.', themeIndex: 6 },
  { id: 'audit-trail', name: 'Audit Trail Logs', icon: FileText, description: 'Who changed what, when. High-ticket security for enterprises.', themeIndex: 7 },
  { id: 'client-portal', name: 'Branded Client Portal', icon: Briefcase, description: 'Custom-branded login for clients. Project progress & deliverables.', themeIndex: 0 },
  { id: 'e-sign', name: 'Document E-Sign', icon: FileText, description: 'Per-signature or unlimited Pro. Digital signing.', themeIndex: 1 },
  { id: 'guest-pass', name: 'Guest Pass Manager', icon: User, description: 'Temporary secure access for contractors. Collaboration seats.', themeIndex: 2 },
  { id: 'repo-intel', name: 'Repo Intelligence', icon: Database, description: 'Sync with internal docs & legal. Autonomous audit dashboards.', themeIndex: 3 },
  { id: 'whatsapp-flow', name: 'WhatsApp Flow Builder', icon: MessageSquare, description: 'Automate WhatsApp messages. Templates and triggers.', themeIndex: 4 },
  { id: 'report-automator', name: 'Report Automator', icon: BarChart3, description: 'Connect reporting dashboards. Daily automated reports.', themeIndex: 5 },
  { id: 'price-scout', name: 'Pricing Scout Bot', icon: ShoppingCart, description: 'Compare products across marketplaces. Shopping agent.', themeIndex: 6 },
  { id: 'weather-bot', name: 'Realtime Weather Bot', icon: Globe, description: 'Chat with a weather agent. Forecasts and alerts.', themeIndex: 7 },
  { id: 'finance-bot', name: 'Finance Bot', icon: DollarSign, description: 'Chat with a finance agent. Portfolios, tips, definitions.', themeIndex: 0 },
  { id: 'dynamic-pricing', name: 'Dynamic Pricing Engine', icon: TrendingUp, description: 'AI-adjusted subscription pricing. Churn-risk based offers.', themeIndex: 1 },
  { id: 'inference-quotas', name: 'Inference Quotas', icon: Cpu, description: 'Tiered pricing per AI inference. e.g. $10 for 100 image gens.', themeIndex: 2 },
  { id: 'offer-engine', name: 'Personalized Offer Engine', icon: Wand2, description: 'One-time discount at "Aha!" moment. AI-triggered offers.', themeIndex: 3 },
  { id: 'verified-badge', name: 'Verified Creator Badge', icon: Key, description: 'Monthly verification fee. Increased reach in discovery.', themeIndex: 4 },
  { id: 'round-up', name: 'Round-Up Engine', icon: DollarSign, description: 'Round-up change for charity or savings. Micro-donations.', themeIndex: 5 },
  { id: 'rewarded-video', name: 'Rewarded Video Ads', icon: Video, description: 'Watch 30s ad to unlock premium for 24h. Optional monetization.', themeIndex: 6 },
  { id: 'nft-utility', name: 'NFT Utility Gate', icon: Key, description: 'NFT grants lifetime access or in-app buffs. Token-gated features.', themeIndex: 7 },
  { id: 'white-label', name: 'White-Label Manager', icon: Briefcase, description: 'Remove platform branding. Enterprise custom branding.', themeIndex: 0 },
  { id: 'dedicated-sla', name: 'Dedicated Support SLA', icon: ShieldCheck, description: 'Guaranteed 1-hour response. High-ticket plan.', themeIndex: 1 },
];

export function AILab({ toolSearchQuery = '' }) {
  const [activeApp, setActiveApp] = useState(APPS_LIST[0]);
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [credits, setCredits] = useState(1540);

  const filteredApps = React.useMemo(() => {
    const q = (toolSearchQuery || '').trim().toLowerCase();
    if (!q) return APPS_LIST;
    return APPS_LIST.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q)
    );
  }, [toolSearchQuery]);

  // Full-page detail view when a tool is opened (no right panel)
  if (view === 'detail' && activeApp) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] text-[#e1e1e6] font-sans">
        <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
          <button
            type="button"
            onClick={() => setView('list')}
            className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Back to marketplace
          </button>
          <ToolDetailView app={activeApp} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] text-[#e1e1e6] font-sans">
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Nexus <span className="text-cyan-400">Marketplace</span>
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                {APPS_LIST.length} AI tools • {credits} credits
              </p>
            </div>
            <button type="button" className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
              SYNC REPO
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {filteredApps.length === 0 ? (
              <div className="col-span-full py-8 text-center text-zinc-500 text-sm">No tools match. Try another search.</div>
            ) : (
              filteredApps.map((app) => (
                <AppTile
                  key={app.id}
                  app={app}
                  onLaunch={() => { setActiveApp(app); setView('detail'); }}
                  theme={getTheme(app.themeIndex ?? 0)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolDetailView({ app }) {
  switch (app.id) {
    case 'arena': return <AIArenaV2 />;
    case 'escrow': return <FintechEscrow />;
    case 'seats': return <AgentSeatManager />;
    case 'reports': return <DataPulseAnalytics />;
    case 'statesnap': return <StateSnapPro />;
    case 'audit': return <AuditEngine />;
    case 'vision': return <VisionOS />;
    case 'vision-os': return <VisionOS />;
    case 'mint': return <TheMint />;
    case 'chatbot-studio': return <ChatbotStudio />;
    default: return <GenericToolView app={app} variant={app.id} />;
  }
}

function AppTile({ app, onLaunch, theme }) {
  const Icon = app.icon;
  const t = theme || getTheme(0);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onLaunch()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLaunch(); } }}
      className={`group rounded-2xl border p-4 sm:p-6 transition-all relative overflow-hidden flex flex-col min-h-[140px] sm:min-h-[180px] cursor-pointer bg-gradient-to-br ${t.bg} border-white/10 hover:border-opacity-60 ${t.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${t.labelBg} ${t.text}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-2 mb-1 line-clamp-2">{app.name}</h3>
      <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{app.description}</p>
    </div>
  );
}

function AIArenaV2() {
  const [state, setState] = useState({ p1: 50, p2: 50, cycle: 0 });
  const [isIntervening, setIsIntervening] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isIntervening) {
        setState((s) => ({
          p1: Math.min(100, Math.max(0, s.p1 + (Math.random() - 0.5) * 10)),
          p2: Math.min(100, Math.max(0, s.p2 + (Math.random() - 0.5) * 10)),
          cycle: s.cycle + 1,
        }));
      }
    }, 800);
    return () => clearInterval(timerRef.current);
  }, [isIntervening]);

  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative">
      <div className="flex justify-between items-start mb-16">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            AI Arena <span className="text-cyan-400">v2.1</span>
          </h2>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-xs">Watcher AI: leveling environment dynamically</p>
        </div>
        <button
          type="button"
          onClick={() => setIsIntervening(!isIntervening)}
          className={`px-8 py-4 rounded-2xl font-black text-sm uppercase transition-all ${isIntervening ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30'}`}
        >
          {isIntervening ? 'Relinquish control' : 'Intervene'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <AgentColumn name="Agent Prime" value={state.p1} color="#00F0FF" />
        <AgentColumn name="Agent Shadow" value={state.p2} color="#8a3ffc" />
      </div>
      <div className="mt-16 bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs">
        <div className="flex items-center gap-2 mb-4 text-cyan-400">
          <Eye size={14} /> WATCHER FEED: CYCLE {state.cycle}
        </div>
        <div className="text-zinc-500">&gt;&gt; Adjusting context windows for competitive parity...</div>
        <div className="text-zinc-500">&gt;&gt; Injecting adversarial noise to Agent Shadow...</div>
        <div className="text-white">&gt;&gt; Watcher: LEVEL UP. Gravity simulation enabled.</div>
      </div>
    </div>
  );
}

function AgentColumn({ name, value, color }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-black uppercase">
        <span className="text-white">{name}</span>
        <span style={{ color }}>{Math.round(value)}% INFERENCE</span>
      </div>
      <div className="h-6 bg-[#1c1c21] rounded-full overflow-hidden p-1 border border-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function FintechEscrow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
        <div className="flex justify-between mb-10">
          <h3 className="text-2xl font-black tracking-tight text-white uppercase">Active escrow contracts</h3>
          <Plus className="text-cyan-400 cursor-pointer" size={20} />
        </div>
        <div className="space-y-4">
          <EscrowItem name="Web3 App Dev" amount="4,500.00" status="Secured" />
          <EscrowItem name="AI Model Training" amount="12,240.00" status="Pending verify" />
          <EscrowItem name="Branded Assets" amount="890.00" status="Disbursed" />
        </div>
      </div>
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-[2.5rem] p-10 text-cyan-400 flex flex-col">
        <CreditCard size={40} className="mb-6" />
        <h3 className="text-xl font-black uppercase mb-2 text-white">Virtual card</h3>
        <p className="text-sm font-bold text-zinc-400 mb-10">Issue instantly for session-based spending.</p>
        <div className="mt-auto bg-black/50 text-white p-6 rounded-2xl border border-white/5">
          <div className="text-[10px] font-black text-zinc-500 mb-4 tracking-widest">NEXUS_SETTLEMENT_CORE</div>
          <div className="text-xl font-bold tracking-widest mb-4">**** **** **** 2026</div>
          <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
            <span>JD PRO</span>
            <span>02/28</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EscrowItem({ name, amount, status }) {
  return (
    <div className="bg-[#1c1c21] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-cyan-400">
          <Anchor size={18} />
        </div>
        <div>
          <div className="font-black text-sm uppercase text-white">{name}</div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase">{status}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-black text-lg tracking-tight text-white">${amount}</div>
        <div className="text-[10px] text-cyan-400 font-black">SETTLE INSTANT</div>
      </div>
    </div>
  );
}

function AgentSeatManager() {
  const seats = [
    { name: 'SupportBot Alpha', uptime: '99.9%', load: 45 },
    { name: 'Pricing Scout', uptime: '92.4%', load: 88 },
    { name: 'Legal Auditor', uptime: '100%', load: 12 },
  ];
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black text-white uppercase">Agent seat dashboard</h3>
        <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-4 py-2 rounded-xl text-xs font-black">4/10 SEATS ACTIVE</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {seats.map((s) => (
          <div key={s.name} className="bg-[#1c1c21] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
            <Bot size={24} className="text-cyan-400 mb-6" />
            <h4 className="font-black text-lg text-white mb-1">{s.name}</h4>
            <div className="flex justify-between text-xs text-zinc-500 font-bold mb-4 uppercase">
              <span>Uptime: {s.uptime}</span>
              <span>Load: {s.load}%</span>
            </div>
            <button type="button" className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-black text-white transition-colors uppercase border border-white/5">
              Configure logic
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataPulseAnalytics() {
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10 flex flex-col lg:flex-row gap-10 items-center">
      <div className="flex-grow">
        <h3 className="text-4xl font-black tracking-tight text-white uppercase mb-4">Repo intelligence</h3>
        <p className="text-zinc-500 mb-8">Autonomous sync with internal documentation & legal templates.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-[#1c1c21] rounded-2xl border border-white/5">
            <div className="text-[10px] font-black text-zinc-500 mb-1">AUDIT SUCCESS</div>
            <div className="text-2xl font-black text-white">100%</div>
          </div>
          <div className="p-6 bg-[#1c1c21] rounded-2xl border border-white/5">
            <div className="text-[10px] font-black text-zinc-500 mb-1">LATENCY LIFT</div>
            <div className="text-2xl font-black text-emerald-400">-120ms</div>
          </div>
        </div>
      </div>
      <div className="shrink-0 w-full lg:w-72 aspect-square bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-[2rem] p-8 text-white flex flex-col justify-end relative">
        <Database size={40} className="absolute top-8 left-8 text-cyan-400" />
        <h4 className="text-xl font-black uppercase leading-tight">Sync status:<br />Aggregated</h4>
        <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-cyan-400">
          <CheckCircle2 size={16} /> 4.2TB COLD STORAGE
        </div>
      </div>
    </div>
  );
}

function StateSnapPro() {
  const [snapshots, setSnapshots] = useState([
    { id: 1, name: 'Workspace Alpha', date: '2026-02-24', size: '2.1 GB' },
    { id: 2, name: 'Pre-migration', date: '2026-02-20', size: '1.8 GB' },
  ]);
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <h3 className="text-2xl font-black text-white uppercase mb-6">State-Snap Pro</h3>
      <p className="text-zinc-500 mb-8">Save and restore environment state. Compute-on-demand when you restore.</p>
      <div className="space-y-4">
        {snapshots.map((s) => (
          <div key={s.id} className="bg-[#1c1c21] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Terminal size={24} className="text-cyan-400" />
              <div>
                <div className="font-black text-white">{s.name}</div>
                <div className="text-xs text-zinc-500">{s.date} • {s.size}</div>
              </div>
            </div>
            <button type="button" className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold">RESTORE</button>
          </div>
        ))}
      </div>
      <button type="button" className="mt-6 px-6 py-3 rounded-xl border border-dashed border-cyan-500/40 text-cyan-400 text-sm font-bold hover:bg-cyan-500/10">+ Create snapshot</button>
    </div>
  );
}

function AuditEngine() {
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <h3 className="text-2xl font-black text-white uppercase mb-6">Audit engine</h3>
      <p className="text-zinc-500 mb-8">SSO logs & legally vetted compliance templates. HIPAA, GDPR, SOC2.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-[#1c1c21]">
          <ShieldCheck size={24} className="text-cyan-400 mb-3" />
          <div className="font-black text-white mb-1">GDPR</div>
          <div className="text-xs text-zinc-500">Consent & data export templates</div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-[#1c1c21]">
          <ShieldCheck size={24} className="text-cyan-400 mb-3" />
          <div className="font-black text-white mb-1">HIPAA</div>
          <div className="text-xs text-zinc-500">BAA & PHI handling</div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-[#1c1c21]">
          <ShieldCheck size={24} className="text-cyan-400 mb-3" />
          <div className="font-black text-white mb-1">SOC2</div>
          <div className="text-xs text-zinc-500">Audit trail & access logs</div>
        </div>
      </div>
      <div className="mt-8 p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-zinc-400">
        Last SSO login: 2026-02-25 02:41 UTC • Okta
      </div>
    </div>
  );
}

function VisionOS() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <h3 className="text-2xl font-black text-white uppercase mb-2">Vision OS</h3>
      <p className="text-zinc-500 mb-8">Upload a room photo. AI suggests redesigns; order print or canvas.</p>
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${uploaded ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/30'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setUploaded(true); }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="vision-upload"
          onChange={() => setUploaded(true)}
        />
        <label htmlFor="vision-upload" className="cursor-pointer block">
          <Image size={48} className="mx-auto text-cyan-400 mb-4" />
          {uploaded ? (
            <span className="text-cyan-400 font-bold">Image received. Processing redesign...</span>
          ) : (
            <>
              <span className="text-white font-bold block mb-2">Drop a room photo or click to upload</span>
              <span className="text-zinc-500 text-sm">PNG, JPG. AI will suggest layouts & styles.</span>
            </>
          )}
        </label>
      </div>
      {uploaded && (
        <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
          Demo: In production, we would run vision model and show before/after + buy print option.
        </div>
      )}
    </div>
  );
}

function TheMint() {
  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <h3 className="text-2xl font-black text-white uppercase mb-2">The Mint</h3>
      <p className="text-zinc-500 mb-8">Verified creator badges & in-app currency exchange.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-white/5 bg-[#1c1c21]">
          <Key size={28} className="text-cyan-400 mb-4" />
          <h4 className="font-black text-white mb-2">Creator verification</h4>
          <p className="text-xs text-zinc-500 mb-4">Monthly fee. Verified badge + increased discovery reach.</p>
          <button type="button" className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold">Apply</button>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-[#1c1c21]">
          <DollarSign size={28} className="text-cyan-400 mb-4" />
          <h4 className="font-black text-white mb-2">Currency exchange</h4>
          <p className="text-xs text-zinc-500 mb-4">Trade in-app points. Platform spread 2.5%.</p>
          <div className="text-sm text-zinc-400 font-mono">1000 pts ↔ 1.00 USD</div>
        </div>
      </div>
    </div>
  );
}

function ChatbotStudio() {
  const [bot, setBot] = useState('finance');
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi. I’m your ' + (bot === 'finance' ? 'Finance' : bot === 'weather' ? 'Weather' : 'Shopping') + ' bot. Ask me anything.' }]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: bot === 'finance' ? 'Based on current markets, diversification is key. Consider index funds for long-term.' : bot === 'weather' ? 'Fetching live data: Partly cloudy, 72°F. Low 58°F tonight.' : 'Comparing across 3 marketplaces: Best price at StoreX, $49.99. Link added.',
        },
      ]);
    }, 600);
  };

  return (
    <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-10">
      <h3 className="text-2xl font-black text-white uppercase mb-6">Chatbot studio</h3>
      <div className="flex gap-2 mb-6">
        {['finance', 'weather', 'shopping'].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBot(b)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${bot === b ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-zinc-400 border border-white/5'}`}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="bg-black/50 rounded-2xl border border-white/5 p-6 h-80 overflow-y-auto space-y-3 font-mono text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right text-cyan-400' : 'text-zinc-300'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#1c1c21] border border-white/5 text-white placeholder-zinc-500 focus:border-cyan-500/40 outline-none"
        />
        <button type="button" onClick={send} className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold">Send</button>
      </div>
    </div>
  );
}

const GENERIC_VIEW_CONFIG = {
  'report-automator': { title: 'Connect reporting source', placeholder: 'Repo URL or dashboard API key', cta: 'Connect & schedule', result: 'Daily reports scheduled. Next run: tomorrow 6:00.' },
  'dashboard-builder': { title: 'Define your dashboard', placeholder: 'Describe metrics and data sources', cta: 'Generate dashboard', result: 'Dashboard generated. Add data sources in Settings.' },
  'whatsapp-flow': { title: 'WhatsApp flow builder', placeholder: 'Template name or trigger keyword', cta: 'Create flow', result: 'Flow created. Trigger: on keyword match.' },
  'trigger-hub': { title: 'Trigger automation', placeholder: 'e.g. Price drop below $X', cta: 'Add trigger', result: 'Trigger active. You will be notified when condition is met.' },
  'cold-storage': { title: 'Cold storage vault', placeholder: 'Dataset or bucket path', cta: 'Archive', result: 'Archived. Access after 30 days will incur retrieval fee.' },
  'compliance-hub': { title: 'Compliance templates', placeholder: 'Industry or region', cta: 'Get template', result: 'Template ready. Download from your workspace.' },
  'guest-pass': { title: 'Guest pass', placeholder: 'Email and expiry (days)', cta: 'Issue pass', result: 'Pass issued. Guest will receive an invite link.' },
  'intent-orchestrator': { title: 'User intent', placeholder: 'Describe what the user wants', cta: 'Route to agents', result: 'Routed to 3 agents. Best response in 2s.' },
  'hitl-credits': { title: 'HITL request', placeholder: 'Task for human verification', cta: 'Submit', result: 'Queued. 1 credit used. ETA 24h.' },
  'virtual-card': { title: 'Session budget', placeholder: 'Max amount (USD)', cta: 'Issue card', result: 'Virtual card issued. Valid for this session.' },
  'micro-insurance': { title: 'Session to insure', placeholder: 'e.g. Drone flight ID', cta: 'Add coverage', result: 'Coverage active. $1.00 premium.' },
  'settlement-gateway': { title: 'Payout amount', placeholder: 'Amount (USD)', cta: 'Instant payout', result: 'Express fee: 1.5%. Payout in 2 hours.' },
  'bnpl': { title: 'Cart total', placeholder: 'Amount', cta: 'Enable BNPL', result: 'Installments: 4x. Partner provider connected.' },
  'compute-demand': { title: 'Compute job', placeholder: 'e.g. 4K render', cta: 'Run', result: 'Job queued. Billing: $0.02/min.' },
  'api-overage': { title: 'API key', placeholder: 'Your key', cta: 'Check usage', result: 'Usage: 78% of free tier. Overage: $0.001/req.' },
  'custom-domain': { title: 'Domain', placeholder: 'yourdomain.com', cta: 'Connect', result: 'DNS instructions sent. Verify CNAME.' },
  'env-snapshot': { title: 'Snapshot name', placeholder: 'e.g. Pre-migration', cta: 'Save', result: 'Snapshot saved. Restore anytime.' },
  'export-credits': { title: 'Export type', placeholder: '4K / PDF batch', cta: 'Start', result: '2 credits used. Export in progress.' },
  'plugin-market': { title: 'Search add-ons', placeholder: 'e.g. Analytics', cta: 'Search', result: '12 plugins found. Install from marketplace.' },
  'asset-generator': { title: 'Asset type', placeholder: 'Skin, avatar, template', cta: 'Generate', result: 'Asset generated. Add to catalog?' },
  'prompt-library': { title: 'Use case', placeholder: 'e.g. Ad copy', cta: 'Get prompt', result: 'Prompt unlocked. Use in your pipeline.' },
  'shoppable-video': { title: 'Video ID', placeholder: 'Product links', cta: 'Embed', result: 'Checkout links embedded. Live.' },
  'template-unlock': { title: 'Template pack', placeholder: 'Choose pack', cta: 'Unlock', result: 'Unlocked. Available in editor.' },
  'sso-gateway': { title: 'IdP', placeholder: 'Okta / Azure', cta: 'Connect', result: 'SSO configured. Test login.' },
  'audit-trail': { title: 'Time range', placeholder: 'Last 30 days', cta: 'Export', result: 'Audit log exported. 1,204 events.' },
  'client-portal': { title: 'Client email', placeholder: 'client@company.com', cta: 'Invite', result: 'Invite sent. Custom branding applied.' },
  'e-sign': { title: 'Document', placeholder: 'Upload or link', cta: 'Request signature', result: 'Sent. Signer will receive email.' },
  'repo-intel': { title: 'Repo path', placeholder: 'org/repo', cta: 'Sync', result: 'Syncing. Docs + legal templates.' },
  'price-scout': { title: 'Product', placeholder: 'Product name or URL', cta: 'Compare', result: 'Compared 3 marketplaces. Best: StoreX $49.' },
  'weather-bot': { title: 'Location', placeholder: 'City or ZIP', cta: 'Get forecast', result: 'Partly cloudy, 72°F. Low 58°F tonight.' },
  'finance-bot': { title: 'Question', placeholder: 'e.g. Portfolio tip', cta: 'Ask', result: 'Diversification is key. Consider index funds.' },
  'dynamic-pricing': { title: 'Plan ID', placeholder: 'Current plan', cta: 'Get offer', result: 'Personalized offer: 15% off for 6 months.' },
  'inference-quotas': { title: 'Quota pack', placeholder: 'e.g. 100 images', cta: 'Add', result: '100 inferences added. $10.' },
  'offer-engine': { title: 'Trigger event', placeholder: 'e.g. Aha moment', cta: 'Set trigger', result: 'Trigger set. Discount fires on event.' },
  'verified-badge': { title: 'Creator ID', placeholder: 'Your handle', cta: 'Apply', result: 'Application received. Review in 48h.' },
  'round-up': { title: 'Round-up cause', placeholder: 'Charity or savings', cta: 'Enable', result: 'Round-up enabled. Avg $0.12/donation.' },
  'rewarded-video': { title: 'Premium feature', placeholder: 'Feature to unlock', cta: 'Configure', result: '30s ad → 24h unlock. Live.' },
  'nft-utility': { title: 'NFT contract', placeholder: 'Contract address', cta: 'Gate feature', result: 'Feature gated. Holders only.' },
  'white-label': { title: 'Brand assets', placeholder: 'Logo URL', cta: 'Apply', result: 'White-label active. Your branding live.' },
  'dedicated-sla': { title: 'Ticket', placeholder: 'Brief description', cta: 'Submit', result: 'Ticket #2026. ETA: 1 hour.' },
};

function GenericToolView({ app, variant }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const config = GENERIC_VIEW_CONFIG[variant] || {
    title: app.name,
    placeholder: 'Configure or connect...',
    cta: 'Initialize',
    result: 'Request received. Processing.',
  };

  const handleSubmit = () => {
    setResult(config.result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-white uppercase mb-1">{app.name}</h3>
        <p className="text-zinc-500 text-sm">{app.description}</p>
      </div>
      <div className="space-y-4">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">{config.title}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={config.placeholder}
          className="w-full px-4 py-3 rounded-xl bg-[#1c1c21] border border-white/5 text-white placeholder-zinc-500 focus:border-cyan-500/40 outline-none text-sm"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold text-sm hover:bg-cyan-500/30 transition-colors"
        >
          {config.cta}
        </button>
      </div>
      {result && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
          {result}
        </div>
      )}
      <p className="text-xs text-zinc-500">Specialized 2026 inference worker. Full integration requires backend.</p>
    </div>
  );
}
