import { motion } from 'framer-motion';
import { Box, FileText, ArrowUpRight } from 'lucide-react';

export const HubSection = () => {
  const hubCards = [
    {
      title: 'The AI Sandbox',
      description: 'Test drive our neural engines in real-time. Build, experiment, and deploy ad campaigns powered by cutting-edge AI.',
      link: 'https://demoai.adsgupta.com',
      icon: Box,
      gradient: 'from-cyan-500/20 via-cyan-600/10 to-blue-600/20',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'The Ad-Insight Blog',
      description: 'Deep dives into the psychology of modern marketing. Strategy, technology, and the future of advertising.',
      link: 'https://blog.adsgupta.com',
      icon: FileText,
      gradient: 'from-violet-500/20 via-purple-600/10 to-pink-600/20',
      iconColor: 'text-violet-400',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      id="hub"
      data-testid="hub-section"
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
            Command Center
          </span>
          <h2 className="section-title text-white">THE HUB</h2>
        </motion.div>

        {/* Hub Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {hubCards.map((card, index) => (
            <motion.a
              key={index}
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              data-testid={`hub-card-${index}`}
              data-hoverable="true"
              className="glass-card group relative rounded-2xl p-8 md:p-10 overflow-hidden"
              whileHover={{ y: -5 }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${card.iconColor}`}>
                  <card.icon size={28} strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-['Space_Grotesk'] tracking-tight">
                  {card.title}
                </h3>

                <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-6">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-white font-medium">
                  <span>Explore</span>
                  <ArrowUpRight 
                    size={18} 
                    className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" 
                  />
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HubSection;
