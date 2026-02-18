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
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Grid background */}
      <div className="grid-background" />
      
      {/* Glow orbs */}
      <div className="glow-orb top-20 -left-40 opacity-30" />
      <div className="glow-orb bottom-20 right-0 opacity-20" />

      {/* Main Container - Using Flexbox for proper alignment */}
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-24 md:py-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          
          {/* Left: Kinetic Typography - Fixed width on desktop */}
          <div className="flex-1 lg:flex-none lg:w-[55%] order-2 lg:order-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              {/* Text container with proper wrapping */}
              <div className="flex flex-wrap leading-none">
                {words.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordVariants}
                    className="hero-title mr-3 md:mr-4 lg:mr-5 mb-1 md:mb-2"
                    style={{
                      fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                      lineHeight: 1.1,
                    }}
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
              className="text-base md:text-lg lg:text-xl text-zinc-400 max-w-xl mb-8 md:mb-10 leading-relaxed"
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
                className="glow-button inline-flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm tracking-wide"
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
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-medium text-sm tracking-wide hover:bg-white/5 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore The Protocols
              </motion.a>
            </motion.div>
          </div>

          {/* Right: 3D Animation - Constrained on desktop */}
          <motion.div
            className="flex-1 lg:flex-none lg:w-[40%] order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative w-full aspect-square max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto lg:mx-0 lg:ml-auto">
              <GeometricAnimation />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
