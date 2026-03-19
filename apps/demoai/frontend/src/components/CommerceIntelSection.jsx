import { motion } from 'framer-motion';
import { TrendingUp, Package, Layout, Clock, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const CommerceIntelSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Predictive Bidding & Dayparting',
      description: 'AI-driven bidding that adapts in real-time to peak shopping hours. Maximize ROAS by targeting high-conversion windows automatically.',
      highlight: 'Up to 40% better ROAS',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Package,
      title: 'Inventory-Synchronized Ads',
      description: 'Spend is automatically paused for low-stock items. Never waste budget advertising products you can\'t fulfill.',
      highlight: 'Zero wasted spend',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Layout,
      title: 'Full-Funnel Onsite Display',
      description: 'Unified workflows for Walmart and Amazon display ads. From awareness to conversion, one platform handles it all.',
      highlight: 'Amazon + Walmart unified',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
  ];

  const platforms = [
    { name: 'Amazon', logo: '🅰️' },
    { name: 'Walmart', logo: '🔵' },
    { name: 'Target', logo: '🎯' },
  ];

  const stats = [
    { value: '340%', label: 'Avg. ROAS Lift' },
    { value: '2.1M+', label: 'SKUs Managed' },
    { value: '98%', label: 'Inventory Sync Accuracy' },
  ];

  return (
    <section
      id="commerce-intel"
      data-testid="commerce-intel-section"
      className="relative py-24 md:py-32 bg-[#0A0A0A]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            Marketplace Solutions
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            COMMERCE INTEL
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
            Retail-trained AI for Amazon, Walmart, and Target sellers. Dominate the digital shelf with neural-powered optimization.
          </p>

          {/* Platform Badges */}
          <div className="flex items-center justify-center gap-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <span className="text-lg">{platform.logo}</span>
                <span className="text-white text-sm font-medium">{platform.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-cyan-400 font-['Space_Grotesk'] mb-1">
                {stat.value}
              </p>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              data-testid={`commerce-feature-${index}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-card group rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon size={28} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Highlight Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${feature.bgColor} border border-white/5`}>
                <Zap size={12} className={feature.color} />
                <span className={`text-xs font-semibold ${feature.color}`}>{feature.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://demoai.adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="commerce-cta"
            data-hoverable="true"
            className="glow-button inline-flex items-center gap-2 px-8 py-4 rounded-full border border-cyan-500/50 text-cyan-400 font-bold text-sm tracking-wide hover:bg-cyan-500/10 hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Commerce Intel
            <ArrowUpRight size={18} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CommerceIntelSection;
