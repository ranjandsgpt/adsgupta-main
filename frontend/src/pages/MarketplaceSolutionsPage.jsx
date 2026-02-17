import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Zap, BarChart3, Package, TrendingUp, ArrowUpRight, CheckCircle, Store, Truck, LayoutDashboard, LineChart, Sparkles } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const MarketplaceSolutionsPage = () => {
  const platforms = [
    { name: 'Amazon', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { name: 'Walmart', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Target', color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'Blinkit', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { name: 'Swiggy', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { name: 'Zomato', color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const features = [
    {
      icon: Store,
      title: 'Amazon/Walmart Seller Hub Integration',
      description: 'Direct API connections to Seller Central and Walmart Seller Center. Unified dashboard for inventory, pricing, and advertising across marketplaces.',
      highlights: ['Real-time inventory sync', 'Automated repricing', 'Cross-platform analytics'],
    },
    {
      icon: Truck,
      title: 'Quick Commerce Optimization',
      description: 'Purpose-built for Blinkit, Swiggy Instamart, and Zomato. Dark store visibility, instant delivery ad placements, and hyperlocal targeting.',
      highlights: ['10-minute delivery zones', 'Dark store inventory', 'Peak hour bidding'],
    },
    {
      icon: Search,
      title: 'Automated Listing SEO',
      description: 'AI-powered keyword research and listing optimization. Neural networks analyze competitor rankings and search trends to maximize organic visibility.',
      highlights: ['Keyword gap analysis', 'A+ Content generation', 'Review sentiment mining'],
    },
  ];

  const stats = [
    { value: '$840M+', label: 'GMV Managed' },
    { value: '2.4M', label: 'SKUs Optimized' },
    { value: '156%', label: 'Avg. Sales Lift' },
    { value: '45K+', label: 'Seller Accounts' },
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
            <span className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Marketplace Intelligence Protocol
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6">
              MARKETPLACE INTEL
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Dominate the digital shelf across Amazon, Walmart, Target, and Quick Commerce platforms. 
              AI-driven optimization for the modern marketplace seller.
            </p>

            {/* Platform Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {platforms.map((platform, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${platform.bg} border border-white/10`}
                >
                  <ShoppingCart size={14} className={platform.color} />
                  <span className="text-white text-sm font-medium">{platform.name}</span>
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
                <p className="text-2xl md:text-3xl font-bold text-emerald-400 font-['Space_Grotesk'] mb-1">
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
                data-testid={`marketplace-feature-${index}`}
                className="glass-card rounded-2xl p-8 md:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
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
                      className="glow-button inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/50 text-emerald-400 font-medium text-sm hover:bg-emerald-500/10"
                      whileHover={{ scale: 1.02 }}
                    >
                      Learn More
                      <ArrowUpRight size={16} />
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {feature.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
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
              Ready to Dominate the Marketplace?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Get a free marketplace audit and discover untapped opportunities across your product catalog.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                data-hoverable="true"
                className="glow-button inline-flex items-center justify-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-xl font-bold"
              >
                Request Marketplace Audit
              </Link>
              <a
                href="https://demoai.adsgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                data-hoverable="true"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/5"
              >
                Try AI Sandbox
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

export default MarketplaceSolutionsPage;
