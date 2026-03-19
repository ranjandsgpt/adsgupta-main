import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Server, Tv, Smartphone, Globe, Cpu, Shield, ArrowUpRight, CheckCircle, Zap, Radio } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import { ChatBot } from '../components/ChatBot';

const SupplyPage = () => {
  const channels = [
    { name: 'Web', icon: Globe },
    { name: 'App', icon: Smartphone },
    { name: 'CTV', icon: Tv },
    { name: 'OTT', icon: Radio },
    { name: 'LLM Crawlers', icon: Cpu },
  ];

  const features = [
    {
      icon: Tv,
      title: 'CTV/OTT Live-Bidding',
      description: 'Real-time programmatic access to premium connected TV and streaming inventory. Server-side ad insertion with sub-second latency for seamless viewer experience.',
      highlights: ['SSAI integration', 'Frequency capping', 'Viewability guarantees'],
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Shield,
      title: 'In-App Identity Solutions',
      description: 'Privacy-first identity resolution for mobile applications. Deterministic and probabilistic matching without reliance on deprecated identifiers.',
      highlights: ['IDFA/GAID alternatives', 'Contextual signals', 'First-party data onboarding'],
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Cpu,
      title: 'LLM Content Ingest APIs (CoMP)',
      description: 'Content Monetization Protocol for AI bot traffic. License your content to LLM providers and monetize crawler visits that traditional ads miss.',
      highlights: ['Bot traffic monetization', 'Content licensing', 'Usage-based billing'],
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  const stats = [
    { value: '180B+', label: 'Monthly Impressions' },
    { value: '45K+', label: 'Publisher Sites' },
    { value: '94%', label: 'Fill Rate' },
    { value: '$4.2', label: 'Avg. CPM Lift' },
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
            <span className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Publisher Yield Architecture
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6">
              NEURAL SUPPLY PROTOCOL
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Next-generation monetization infrastructure for publishers. Maximize yield across every channel 
              with audience-first optimization and AI-powered floor pricing.
            </p>

            {/* Channel Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {channels.map((channel, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20"
                >
                  <channel.icon size={16} className="text-orange-400" />
                  <span className="text-white text-sm font-medium">{channel.name}</span>
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
                <p className="text-2xl md:text-3xl font-bold text-orange-400 font-['Space_Grotesk'] mb-1">
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
                data-testid={`supply-feature-${index}`}
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
                      className={`glow-button inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-orange-500/50 text-orange-400 font-medium text-sm hover:bg-orange-500/10`}
                      whileHover={{ scale: 1.02 }}
                    >
                      Explore Integration
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

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-6">
              Maximize Your Publisher Revenue
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Connect your inventory to our neural yield engine and start seeing results within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                data-hoverable="true"
                className="glow-button inline-flex items-center justify-center gap-2 bg-orange-500 text-black px-8 py-4 rounded-xl font-bold"
              >
                Start Integration
              </Link>
              <a
                href="https://demoai.adsgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                data-hoverable="true"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/5"
              >
                View Documentation
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

export default SupplyPage;
