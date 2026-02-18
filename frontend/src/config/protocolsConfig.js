/**
 * protocolsConfig.js - Single Source of Truth for All Protocols
 * Used by: Navigation Mega-Menu, Omni-Nav Bar, Footer, etc.
 */

export const protocolsConfig = [
  {
    id: 'amazon-audit',
    name: 'Amazon Audit',
    shortName: 'Amazon',
    description: 'AI-powered Amazon seller optimization',
    icon: 'ShoppingCart',
    href: '/audit',
    external: false,
    status: 'live', // 'live' | 'beta' | 'coming-soon'
    category: 'marketplace',
    color: 'orange',
  },
  {
    id: 'walmart-audit',
    name: 'Walmart Audit',
    shortName: 'Walmart',
    description: 'Walmart marketplace intelligence',
    icon: 'Store',
    href: '/walmart-audit',
    external: false,
    status: 'coming-soon',
    category: 'marketplace',
    color: 'blue',
  },
  {
    id: 'insights-engine',
    name: 'Insights Engine',
    shortName: 'Insights',
    description: 'Neural analytics & deep reporting',
    icon: 'LineChart',
    href: '/neural-map',
    external: false,
    status: 'live',
    category: 'analytics',
    color: 'violet',
  },
  {
    id: 'demoai',
    name: 'DemoAI Sandbox',
    shortName: 'DemoAI',
    description: 'Test drive the neural engines',
    icon: 'Sparkles',
    href: 'https://demoai.adsgupta.com',
    external: true,
    status: 'live',
    category: 'demo',
    color: 'cyan',
  },
  {
    id: 'talentos',
    name: 'TalentOS',
    shortName: 'TalentOS',
    description: 'AI career acceleration platform',
    icon: 'GraduationCap',
    href: '/talentos',
    external: false,
    status: 'live',
    category: 'tools',
    color: 'emerald',
  },
  {
    id: 'monetization',
    name: 'Monetization AI',
    shortName: 'Monetize',
    description: 'Native ad engine with SLM intelligence',
    icon: 'DollarSign',
    href: '/monetization',
    external: false,
    status: 'live',
    category: 'monetization',
    color: 'amber',
  },
];

// Helper functions
export const getLiveProtocols = () => 
  protocolsConfig.filter(p => p.status === 'live');

export const getProtocolsByCategory = (category) => 
  protocolsConfig.filter(p => p.category === category);

export const getProtocolById = (id) => 
  protocolsConfig.find(p => p.id === id);

// Navigation items for mega-menu
export const navProtocolItems = protocolsConfig.map(p => ({
  label: p.name,
  href: p.href,
  external: p.external,
  status: p.status,
  description: p.description,
  color: p.color,
}));

// Brand naming conventions
export const brandNames = {
  ecosystem: 'The Neural Engine',
  products: 'The Protocols',
  company: 'AdsGupta',
  tagline: 'Advertising at the Speed of Thought',
};

export default protocolsConfig;
