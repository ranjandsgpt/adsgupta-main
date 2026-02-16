import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Users, Megaphone, Store, Building, GraduationCap, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const StakeholderSection = () => {
  const scrollRef = useRef(null);

  const stakeholders = [
    {
      title: 'Publishers',
      description: 'Maximize yield with AI-driven monetization',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Influencers',
      description: 'Scale your brand partnerships intelligently',
      icon: Megaphone,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Advertisers',
      description: 'Reach the right audience at the right moment',
      icon: Store,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Sellers',
      description: 'Dominate marketplace advertising',
      icon: Store,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Agencies',
      description: 'Enterprise tools for trading desks',
      icon: Building,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
    {
      title: 'Interns',
      description: 'Launch your ad-tech career',
      icon: GraduationCap,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Individuals',
      description: 'Personal brand growth solutions',
      icon: User,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="stakeholders"
      data-testid="stakeholder-section"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              For Every Player
            </span>
            <h2 className="section-title text-white">NETWORK SOLUTIONS</h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-3 mt-6 md:mt-0">
            <motion.button
              data-testid="stakeholder-scroll-left"
              data-hoverable="true"
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </motion.button>
            <motion.button
              data-testid="stakeholder-scroll-right"
              data-hoverable="true"
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </motion.button>
          </div>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stakeholders.map((stakeholder, index) => (
              <motion.div
                key={index}
                data-testid={`stakeholder-card-${index}`}
                className="flex-shrink-0 w-[280px] snap-start"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="glass-card group rounded-2xl p-6 h-full hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-14 h-14 rounded-xl ${stakeholder.bgColor} flex items-center justify-center mb-5 ${stakeholder.color}`}>
                    <stakeholder.icon size={28} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk'] tracking-tight">
                    {stakeholder.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {stakeholder.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-[#121212] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#121212] to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default StakeholderSection;
