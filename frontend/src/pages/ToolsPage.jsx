import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Search, TrendingUp, Users, FileText, Bot, ArrowUpRight, Sparkles, BarChart3, Briefcase, ExternalLink } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const ToolsPage = () => {
  const tools = [
    {
      icon: Search,
      title: 'SEO Intelligence Suite',
      description: 'AI-powered keyword research, competitor analysis, and ranking predictions. Optimize your organic visibility across search engines.',
      status: 'Live',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      link: '#seo',
      internal: true,
    },
    {
      icon: TrendingUp,
      title: 'Growth Audit Engine',
      description: 'Comprehensive analysis of your digital presence. Get actionable recommendations for UA, retention, and monetization.',
      status: 'Live',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      link: '/audit',
      internal: true,
      highlight: true,
    },
    {
      icon: Users,
      title: 'Affiliate Network Manager',
      description: 'Track, optimize, and scale your affiliate partnerships. Real-time attribution and commission management.',
      status: 'Live',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      link: '#affiliate',
      internal: true,
    },
    {
      icon: FileText,
      title: 'AI Content Studio',
      description: 'Generate high-converting ad copy, landing pages, and product descriptions. Trained on billion-dollar campaigns.',
      status: 'Live',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      link: '#content',
      internal: true,
    },
  ];

  // TalentOS - Career tools moved to separate subdomain
  const talentOSTools = [
    {
      icon: Bot,
      title: 'Interview AI Coach',
      description: 'AI-powered mock interviews with real-time feedback. Recursive questioning from senior hiring managers.',
      status: 'TalentOS',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      icon: Briefcase,
      title: 'Career Path Navigator',
      description: 'Personalized career recommendations based on your skills, experience, and interests in ad-tech.',
      status: 'TalentOS',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
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
            <span className="text-sky-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Utility Dashboard
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6">
              THE LAB
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">
              A unified toolkit for modern marketers. From SEO intelligence to AI-powered content generation 
              and ad-tech career development.
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                data-testid={`tool-card-${index}`}
                className="glass-card group rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center ${tool.color}`}>
                    <tool.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                    ${tool.status === 'Live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {tool.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-3">
                  {tool.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                  {tool.description}
                </p>

                <motion.button
                  data-hoverable="true"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium
                    hover:bg-white/10 hover:border-${tool.color.split('-')[1]}-500/30 transition-all`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {tool.status === 'Live' ? 'Launch Tool' : 'Join Waitlist'}
                  <ArrowUpRight size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-zinc-400 text-sm">More tools coming soon</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mb-4">
              Have a Tool Request?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              We're constantly building new utilities for the ad-tech community. Let us know what you need.
            </p>
            <Link
              to="/contact"
              data-hoverable="true"
              className="glow-button inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-cyan-500/50 text-cyan-400 font-bold hover:bg-cyan-500/10"
            >
              Request a Tool
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default ToolsPage;
