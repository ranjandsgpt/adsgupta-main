import { motion } from 'framer-motion';
import { Monitor, Server, Users, Zap, BarChart3, Globe, ArrowUpRight } from 'lucide-react';

export const MultiStakeholderGrid = () => {
  const stakeholderSolutions = [
    {
      category: 'Demand-Side',
      tagline: 'For Advertisers & Brands',
      icon: Monitor,
      color: 'from-cyan-500/20 to-blue-600/20',
      iconColor: 'text-cyan-400',
      features: [
        {
          title: 'Programmatic RTB',
          description: 'Real-time bidding across premium inventory with neural optimization for maximum reach and efficiency.',
        },
        {
          title: 'Enterprise DSP Tools',
          description: 'White-label demand-side platform solutions with advanced audience segmentation and cross-device targeting.',
        },
      ],
    },
    {
      category: 'Supply-Side',
      tagline: 'For Publishers & SSPs',
      icon: Server,
      color: 'from-emerald-500/20 to-teal-600/20',
      iconColor: 'text-emerald-400',
      features: [
        {
          title: 'Publisher Yield Maximization',
          description: 'AI-powered floor pricing and header bidding optimization to extract maximum value from every impression.',
        },
        {
          title: 'SSP Integrations',
          description: 'Seamless connections with major supply-side platforms. Unified analytics across all demand sources.',
        },
      ],
    },
    {
      category: 'Social/Influencer',
      tagline: 'For Creators & Agencies',
      icon: Users,
      color: 'from-violet-500/20 to-purple-600/20',
      iconColor: 'text-violet-400',
      features: [
        {
          title: 'Automated Creator Matching',
          description: 'Neural networks identify ideal influencer-brand pairings based on audience overlap and engagement patterns.',
        },
        {
          title: 'Viral Marketing Engine',
          description: 'Predictive content scoring and automated campaign scaling for creator-driven viral marketing.',
        },
      ],
    },
  ];

  return (
    <section
      id="solutions-grid"
      data-testid="multi-stakeholder-grid"
      className="relative py-24 md:py-32"
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
            Ecosystem Solutions
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            MULTI-STAKEHOLDER PLATFORM
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Whether you're buying, selling, or creating—our AI adapts to your side of the marketplace.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stakeholderSolutions.map((solution, index) => (
            <motion.div
              key={index}
              data-testid={`stakeholder-solution-${index}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-card group rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Header */}
              <div className={`p-6 bg-gradient-to-br ${solution.color}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ${solution.iconColor}`}>
                    <solution.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                      {solution.category}
                    </h3>
                    <p className="text-white/60 text-sm">{solution.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 space-y-6">
                {solution.features.map((feature, featureIndex) => (
                  <div key={featureIndex}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className={solution.iconColor} />
                      <h4 className="text-white font-semibold text-sm font-['Space_Grotesk']">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed pl-5">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="px-6 pb-6">
                <motion.button
                  data-hoverable="true"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium
                    hover:bg-white/10 hover:border-white/20 transition-all duration-300`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Learn More
                  <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Globe, value: '150+', label: 'DSP Integrations' },
            { icon: Server, value: '80+', label: 'SSP Partners' },
            { icon: Users, value: '50K+', label: 'Creator Network' },
            { icon: BarChart3, value: '$2.4B', label: 'Annual Ad Spend' },
          ].map((stat, index) => (
            <div
              key={index}
              data-testid={`solution-stat-${index}`}
              className="neumorphic-card p-6 text-center"
            >
              <stat.icon size={24} className="text-cyan-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-1">{stat.value}</p>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MultiStakeholderGrid;
