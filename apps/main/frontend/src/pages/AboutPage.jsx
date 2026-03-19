import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Linkedin, ExternalLink, ArrowUpRight, Sparkles, Cpu } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import PersistentSLMChat from '../components/PersistentSLMChat';

const AboutPage = () => {
  const founders = [
    {
      name: 'Pousali Dasgupta',
      tagline: 'Strategic Ad-Tech Leader & Growth Architect',
      portfolio: 'https://pousali.adsgupta.com',
      linkedin: 'https://linkedin.com/in/pousalidasgupta',
      avatar: null, // Placeholder - will be handled via user login
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 to-purple-500/5',
    },
    {
      name: 'Ranjan Dasgupta',
      tagline: 'Technical Visionary & Neural Systems Specialist',
      portfolio: 'https://ranjan.adsgupta.com',
      linkedin: 'https://linkedin.com/in/ranjandasgupta',
      avatar: null, // Placeholder - will be handled via user login
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-500/10 to-blue-500/5',
    },
  ];

  // Generate initials for avatar placeholder
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          {/* Minimalist Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cpu size={16} className="text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase">
                The Neural Engine
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
              Meet the Architects
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Building the future of AI-native advertising
            </p>
          </motion.div>

          {/* Two-Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                data-testid={`founder-card-${index}`}
                className={`relative rounded-2xl bg-gradient-to-br ${founder.bgGradient} border border-white/5 p-8 md:p-10 group hover:border-white/10 transition-all duration-500`}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${founder.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* Avatar Placeholder */}
                  <div className="mb-6">
                    {founder.avatar ? (
                      <img
                        src={founder.avatar}
                        alt={founder.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${founder.gradient} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">
                          {getInitials(founder.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name & Tagline */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-2">
                    {founder.name}
                  </h2>
                  <p className="text-zinc-400 text-base md:text-lg mb-8">
                    {founder.tagline}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.a
                      href={founder.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`founder-portfolio-${index}`}
                      data-hoverable="true"
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r ${founder.gradient} text-white font-medium text-sm hover:opacity-90 transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink size={16} />
                      Portfolio
                    </motion.a>
                    
                    <motion.a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`founder-linkedin-${index}`}
                      data-hoverable="true"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Simple CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/contact"
              data-testid="about-cta"
              data-hoverable="true"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
            >
              <Sparkles size={16} className="text-cyan-400" />
              Start a Conversation
              <ArrowUpRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      <PersistentSLMChat />
    </div>
  );
};

export default AboutPage;
