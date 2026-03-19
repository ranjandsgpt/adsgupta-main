import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import GeometricAnimation from './GeometricAnimation';

export const HeroSection = () => {
  const words = ['ADVERTISING', 'AT', 'THE', 'SPEED', 'OF', 'THOUGHT.'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { 
      y: 100, 
      opacity: 0,
      rotateX: -90,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-0"
    >
      {/* Grid background */}
      <div className="grid-background" />
      
      {/* Glow orbs */}
      <div className="glow-orb top-20 -left-40 opacity-30" />
      <div className="glow-orb bottom-20 right-0 opacity-20" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Kinetic Typography */}
          <div className="order-2 lg:order-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <div className="flex flex-wrap">
                {words.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordVariants}
                    className="hero-title mr-4 md:mr-6 mb-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed"
            >
              The first AI-native platform that predicts consumer desire before it happens.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href="https://demoai.adsgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-cta-primary"
                data-hoverable="true"
                className="glow-button inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Enter the Sandbox
                <ArrowRight size={18} />
              </motion.a>

              <motion.a
                href="#hub"
                data-testid="hero-cta-secondary"
                data-hoverable="true"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-white/5 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Hub
              </motion.a>
            </motion.div>
          </div>

          {/* Right: 3D Animation */}
          <motion.div
            className="order-1 lg:order-2 h-[300px] md:h-[500px] lg:h-[600px] relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <GeometricAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
