import { motion } from 'framer-motion';
import { FileText, ShoppingCart, Server, Box, Wrench, ArrowUpRight, Zap, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HubSection = () => {
  const hubCards = [
    {
      title: 'The Ad Exchange',
      description:
        'Full-stack programmatic exchange — real-time bidding, header bidding, publisher yield, and advertiser demand management.',
      link: 'https://exchange.adsgupta.com',
      external: true,
      icon: Server,
      gradient: 'from-cyan-500/20 via-cyan-600/10 to-blue-600/20',
      iconColor: 'text-cyan-400',
      badge: 'LIVE',
      comingSoon: false,
    },
    {
      title: 'Marketplace Intel',
      description:
        'Amazon, Walmart, Target, Blinkit, Swiggy, Zomato — AI-powered audits, seller dashboards, listing optimization, and PPC intelligence.',
      link: 'https://marketplace.adsgupta.com',
      external: true,
      icon: ShoppingCart,
      gradient: 'from-emerald-500/20 via-green-600/10 to-teal-600/20',
      iconColor: 'text-emerald-400',
      badge: 'LIVE',
      comingSoon: false,
    },
    {
      title: 'The AI Sandbox',
      description:
        'Interactive playground to explore neural engines, bid simulations, creative analysis, and AI-powered advertising experiments.',
      link: 'https://demoai.adsgupta.com',
      external: true,
      icon: Box,
      gradient: 'from-cyan-500/20 via-cyan-600/10 to-blue-600/20',
      iconColor: 'text-cyan-400',
      badge: 'LIVE',
      comingSoon: false,
    },
    {
      title: 'The Insight Engine',
      description:
        'Deep analytics and neural reporting across exchange performance, marketplace health, and advertising intelligence.',
      link: 'https://marketplace.adsgupta.com',
      external: true,
      icon: FileText,
      gradient: 'from-violet-500/20 via-purple-600/10 to-pink-600/20',
      iconColor: 'text-violet-400',
      badge: 'LIVE',
      comingSoon: false,
    },
    {
      title: 'TalentOS',
      description:
        'AI career acceleration — resume intelligence, mock interviews with 4 AI personas, company research, and global job discovery.',
      link: 'https://talentos.adsgupta.com',
      external: true,
      icon: GraduationCap,
      gradient: 'from-emerald-500/20 via-green-600/10 to-teal-600/20',
      iconColor: 'text-emerald-400',
      badge: 'LIVE',
      comingSoon: false,
    },
    {
      title: 'The Lab',
      description:
        'Experimental tools, utilities, and next-gen advertising technology prototypes. Where the future gets tested before it ships.',
      link: null,
      external: false,
      icon: Wrench,
      gradient: 'from-sky-500/20 via-blue-600/10 to-indigo-600/20',
      iconColor: 'text-sky-400',
      badge: 'COMING SOON',
      comingSoon: true,
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

  const CardWrapper = ({ card, children }) => {
    if (card.comingSoon) {
      return (
        <div data-hoverable="true" className="block h-full opacity-60">
          {children}
        </div>
      );
    }
    if (card.external) {
      return (
        <a
          href={card.link}
          target="_blank"
          rel="noopener noreferrer"
          data-hoverable="true"
          className="block h-full"
        >
          {children}
        </a>
      );
    }
    return (
      <Link to={card.link} data-hoverable="true" className="block h-full">
        {children}
      </Link>
    );
  };

  return (
    <section id="hub" data-testid="hub-section" className="relative py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            EVERY PROTOCOL HAS ITS PURPOSE. WE HAVE SIX.
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
            THE PROTOCOLS
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
            Your gateway to the complete advertising intelligence ecosystem. Six protocols — spanning monetization,
            commerce, AI exploration, and career tech.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {hubCards.map((card, index) => (
            <motion.div key={index} variants={cardVariants} data-testid={`hub-card-${index}`}>
              <CardWrapper card={card}>
                <div
                  className="glass-card group relative rounded-2xl p-6 md:p-8 overflow-hidden h-full
                    hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
                    <Zap size={10} className={card.iconColor} />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">{card.badge}</span>
                  </div>

                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${card.iconColor} group-hover:border-current/30 transition-colors`}
                    >
                      <card.icon size={24} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 font-['Space_Grotesk'] tracking-tight">
                      {card.title}
                    </h3>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-5">{card.description}</p>

                    {card.comingSoon ? (
                      <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                        <span>Coming Soon</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <span>Enter Protocol →</span>
                        <ArrowUpRight
                          size={16}
                          className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </CardWrapper>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HubSection;
