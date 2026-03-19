import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Monitor, Users, Target, Layers, Bot, BarChart3, ArrowUpRight, CheckCircle, Zap, Network } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const DemandPage = () => {
  const capabilities = [
    { name: 'Programmatic', icon: Layers },
    { name: 'Social', icon: Users },
    { name: 'Search', icon: Target },
    { name: 'CTV/Video', icon: Monitor },
    { name: 'A2A Protocols', icon: Bot },
  ];

  const features = [
    {
      icon: Layers,
      title: 'Programmatic Bidders',
      description: 'Custom bidding algorithms tailored to your KPIs. White-label DSP infrastructure with access to 150+ exchanges and SSPs worldwide.',
      highlights: ['Custom bid algorithms', '150+ exchange access', 'Real-time optimization'],
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      icon: Bot,
      title: 'Agent-to-Agent (A2A) Protocols',
      description: 'Next-generation advertising where AI agents negotiate deals autonomously. Your buying agent communicates directly with publisher selling agents.',
      highlights: ['Autonomous negotiation', 'Dynamic deal terms', 'Zero-latency transactions'],
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Network,
      title: 'Cross-Publisher Frequency Optimization',
      description: 'Unified frequency management across all publishers and platforms. Prevent ad fatigue while maximizing reach and conversion.',
      highlights: ['Cross-platform dedup', 'Optimal exposure sequencing', 'Budget efficiency'],
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ];

  const stats = [
    { value: '$2.4B', label: 'Annual Spend Managed' },
    { value: '150+', label: 'DSP Integrations' },
    { value: '340%', label: 'Avg. ROAS Improvement' },
    { value: '12ms', label: 'Avg. Bid Latency' },
  ];

  return (
    <div className="min-h-screen bg-[#121212] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-rose-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              AI-Native Advertising Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6">
              UNIVERSAL DEMAND ENGINE
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              The AI-native alternative to Google Marketing Platform. Custom bidders, Reseller DSP access, 
              and Agentic AI targeting for the next era of programmatic advertising.
            </p>

            {/* Capability Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {capabilities.map((cap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20"
                >
                  <cap.icon size={16} className="text-rose-400" />
                  <span className="text-white text-sm font-medium">{cap.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="neumorphic-card p-6 text-center">
                <p className="text-2xl md:text-3xl font-bold text-rose-400 font-['Space_Grotesk'] mb-1">
                  {stat.value}
                </p>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature Sections */}
          <div className="space-y-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                data-testid={`demand-feature-${index}`}
                className="glass-card rounded-2xl p-8 md:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 ${feature.color}`}>
                      <feature.icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <motion.button
                      data-hoverable="true"
                      className={`glow-button inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-500/50 text-rose-400 font-medium text-sm hover:bg-rose-500/10`}
                      whileHover={{ scale: 1.02 }}
                    >
                      Request Access
                      <ArrowUpRight size={16} />
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {feature.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                        <Zap size={18} className={feature.color} />
                        <span className="text-white font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DSP Reseller Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass-card rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mb-4">
              Reseller DSP Access
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              White-label our demand infrastructure for your agency or trading desk. 
              Full API access, custom branding, and dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                data-hoverable="true"
                className="glow-button inline-flex items-center justify-center gap-2 bg-rose-500 text-black px-8 py-4 rounded-xl font-bold"
              >
                Become a Reseller
              </Link>
              <a
                href="https://demoai.adsgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                data-hoverable="true"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/5"
              >
                Platform Demo
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default DemandPage;
