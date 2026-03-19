import { motion } from 'framer-motion';
import { TrendingUp, Package, Layout, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketplaceSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Predictive Bidding & Dayparting',
      description: 'AI-driven bidding that adapts in real-time to peak shopping hours.',
      highlight: 'Up to 40% better ROAS',
    },
    {
      icon: Package,
      title: 'Inventory-Synchronized Ads',
      description: 'Spend is automatically paused for low-stock items.',
      highlight: 'Zero wasted spend',
    },
    {
      icon: Layout,
      title: 'Full-Funnel Onsite Display',
      description: 'Unified workflows for Walmart and Amazon display ads.',
      highlight: 'Amazon + Walmart unified',
    },
  ];

  const platforms = [
    { name: 'Amazon' },
    { name: 'Walmart' },
    { name: 'Target' },
    { name: 'Blinkit' },
    { name: 'Swiggy' },
    { name: 'Zomato' },
  ];

  return (
    <section
      id="marketplace"
      data-testid="marketplace-section"
      className="relative py-24 md:py-32 bg-[#0A0A0A]"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            Feature Deep-Dive
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            MARKETPLACE INTEL
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Retail-trained AI for Amazon, Walmart, Target, and Quick Commerce platforms.
          </p>

          {/* Platform Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium"
              >
                {platform.name}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              data-testid={`marketplace-feature-${index}`}
              className="glass-card rounded-2xl p-6 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                <feature.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                {feature.description}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Zap size={10} className="text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">{feature.highlight}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link
            to="/marketplacesolutions"
            data-testid="marketplace-cta"
            data-hoverable="true"
            className="glow-button inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/50 text-emerald-400 font-medium text-sm hover:bg-emerald-500/10 hover:text-white transition-all"
          >
            Explore Marketplace Intel
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
