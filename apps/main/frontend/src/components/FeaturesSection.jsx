import { motion } from 'framer-motion';
import { Zap, Brain, Palette, Target, BarChart3, Shield } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Optimization',
      description:
        'Millisecond-level decisioning across programmatic auctions, marketplace pricing, and demand allocation — optimizing yield in real time.',
    },
    {
      icon: Brain,
      title: 'Neural Targeting',
      description:
        'Contextual and behavioral intelligence layers that connect the right demand to the right inventory, the right product to the right buyer.',
    },
    {
      icon: Palette,
      title: 'Predictive Creative',
      description:
        'AI-generated insights on listing performance, ad creative effectiveness, and content optimization across channels.',
    },
    {
      icon: Target,
      title: 'Precision Audiences',
      description:
        'First-party audience intelligence, seller segmentation, and job-seeker profiling — privacy-first, across every protocol.',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description:
        'Unified reporting across exchange performance, marketplace KPIs, campaign attribution, and career intelligence metrics.',
    },
    {
      icon: Shield,
      title: 'Brand Safety',
      description:
        'Inventory quality scoring, listing compliance checks, and content classification — keeping every side of the ecosystem clean.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120,
      },
    },
  };

  return (
    <section
      id="features"
      data-testid="features-section"
      className="relative py-24 md:py-32 bg-[#0A0A0A]"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            THE CORE
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            THE NEURAL ENGINE
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            The shared intelligence layer behind every protocol — from real-time auction decisions to marketplace audits
            to career matching.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              data-testid={`feature-card-${index}`}
              className="neumorphic-card p-8 group hover:translate-y-[-4px] transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors duration-300">
                <feature.icon size={24} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 font-['Space_Grotesk'] tracking-tight">
                {feature.title}
              </h3>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
