import { motion } from 'framer-motion';
import { Zap, Brain, Palette, Target, BarChart3, Shield } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Optimization',
      description: 'Milliseconds matter. We adjust bids and placements instantly based on live performance data.',
    },
    {
      icon: Brain,
      title: 'Neural Targeting',
      description: 'Find customers who don\'t know they need you yet. Our AI predicts intent before action.',
    },
    {
      icon: Palette,
      title: 'Predictive Creative',
      description: 'Generate high-converting visuals on the fly. A/B test at scale without the wait.',
    },
    {
      icon: Target,
      title: 'Precision Audiences',
      description: 'Build hyper-specific cohorts that convert. Every impression counts.',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Go beyond vanity metrics. Understand the true ROI of every creative decision.',
    },
    {
      icon: Shield,
      title: 'Brand Safety',
      description: 'AI-powered content screening ensures your ads appear in the right context.',
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
            Capabilities
          </span>
          <h2 className="section-title text-white mb-4">THE NEURAL ENGINE</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Every feature built for speed, precision, and scale.
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

              <p className="text-zinc-400 text-base leading-relaxed">
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
