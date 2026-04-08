import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Users, Megaphone, Store, Building, GraduationCap, ChevronLeft, ChevronRight, Globe, Server, BarChart3 } from 'lucide-react';

export const NetworkSection = () => {
  const scrollRef = useRef(null);

  const stakeholders = [
    {
      title: 'Publishers',
      description:
        'Monetize web, app, and CTV inventory with AI-optimized programmatic demand and real-time yield management.',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Sellers',
      description:
        'Audit and optimize Amazon, Walmart, Blinkit, and Swiggy listings — find revenue leaks, fix listings, grow sales.',
      icon: Store,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Advertisers',
      description:
        'Reach audiences across the open exchange with precision targeting, real-time bidding, and transparent reporting.',
      icon: Megaphone,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Job Seekers',
      description:
        'AI-powered resume analysis, mock interviews with 4 personas, company research, and job discovery across 10+ countries.',
      icon: GraduationCap,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Agencies',
      description:
        'Strategy and intelligence tools spanning both programmatic monetization and marketplace commerce — one ecosystem for the full value chain.',
      icon: Building,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
  ];

  const globalStats = [
    { icon: Globe, value: '150+', label: 'Pages of Documentation' },
    { icon: Server, value: '7', label: 'Live Protocols' },
    { icon: Users, value: '50K+', label: 'Lines of Code' },
    { icon: BarChart3, value: '8', label: 'Content Verticals' },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="network"
      data-testid="network-section"
      className="relative py-24 md:py-32"
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
          <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            THE ECOSYSTEM
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            THE ADS GUPTA NETWORK
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            One ecosystem. Two operators. Every stakeholder in the advertising value chain — from publishers to sellers to
            agencies to job seekers.
          </p>
        </motion.div>

        {/* Global Reach Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {globalStats.map((stat, index) => (
            <div
              key={index}
              data-testid={`global-stat-${index}`}
              className="neumorphic-card p-5 text-center"
            >
              <stat.icon size={20} className="text-cyan-400 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-xl md:text-2xl font-bold text-white font-['Space_Grotesk'] mb-0.5">{stat.value}</p>
              <p className="text-zinc-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Stakeholder Cards Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6"
        >
          <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
            For Every Player
          </h3>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              data-testid="network-scroll-left"
              data-hoverable="true"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </motion.button>
            <motion.button
              data-testid="network-scroll-right"
              data-hoverable="true"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={18} strokeWidth={1.5} />
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
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stakeholders.map((stakeholder, index) => (
              <motion.div
                key={index}
                data-testid={`network-card-${index}`}
                className="flex-shrink-0 w-[240px] snap-start"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="glass-card group rounded-xl p-5 h-full hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-12 h-12 rounded-xl ${stakeholder.bgColor} flex items-center justify-center mb-4 ${stakeholder.color}`}>
                    <stakeholder.icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-1.5 font-['Space_Grotesk']">
                    {stakeholder.title}
                  </h4>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {stakeholder.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[#121212] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[#121212] to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default NetworkSection;
