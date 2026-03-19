import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, ExternalLink, Award, TrendingUp, Users, Globe, ArrowUpRight } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const AboutPage = () => {
  const founders = [
    {
      name: 'Ranjan Dasgupta',
      role: 'Co-Founder & CEO',
      portfolio: 'https://ranjan.adsgupta.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      bio: 'Former General Manager at Britannia Industries. 15+ years shaping brand narratives at the intersection of consumer psychology and technology.',
      highlights: ['Britannia Industries GM', '500M+ consumers reached', 'FMCG & Digital Transformation'],
    },
    {
      name: 'Pousali Dasgupta',
      role: 'Co-Founder & COO',
      portfolio: 'https://pousali.adsgupta.com',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
      bio: 'Strategic operations leader with expertise in scaling ad-tech platforms. Driving operational excellence across Supply, Demand, and Marketplace divisions.',
      highlights: ['Operations Excellence', 'Platform Scaling', 'Cross-functional Leadership'],
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Multiple awards for innovation in AI-driven advertising technology',
    },
    {
      icon: TrendingUp,
      title: '15+ Years Combined',
      description: 'Deep expertise across FMCG, retail, and digital advertising',
    },
    {
      icon: Users,
      title: 'Team of 50+',
      description: 'Engineers, data scientists, and ad-tech specialists',
    },
    {
      icon: Globe,
      title: 'Pan-India Impact',
      description: 'Campaigns reaching 500M+ consumers across diverse markets',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Leadership
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6">
              THE FOUNDERS' CIRCLE
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">
              Building the future of neural advertising. Meet the minds behind Ads Gupta's vision 
              of AI-native marketing infrastructure.
            </p>
          </motion.div>

          {/* Founders Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                data-testid={`founder-card-${index}`}
                className="glass-card group rounded-2xl overflow-hidden"
              >
                {/* Profile Image with Gradient Overlay */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
                  
                  {/* Digital DNA Background Effect */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,240,255,0.1)_25%,rgba(0,240,255,0.1)_50%,transparent_50%,transparent_75%,rgba(0,240,255,0.1)_75%)] bg-[length:20px_20px] animate-pulse" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 -mt-16 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                        {founder.name}
                      </h3>
                      <p className="text-cyan-400 font-medium">{founder.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="#"
                        data-hoverable="true"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Linkedin size={18} strokeWidth={1.5} />
                      </a>
                      <a
                        href="#"
                        data-hoverable="true"
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Twitter size={18} strokeWidth={1.5} />
                      </a>
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed mb-6">
                    {founder.bio}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {founder.highlights.map((highlight, hIndex) => (
                      <span
                        key={hIndex}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Portfolio Link */}
                  <motion.a
                    href={founder.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`founder-portfolio-${index}`}
                    data-hoverable="true"
                    className="glow-button w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 text-white font-medium
                      hover:from-cyan-500/20 hover:to-violet-500/20 transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <ExternalLink size={16} />
                    View Portfolio
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Company Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mb-8 text-center">
              Milestones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((item, index) => (
                <motion.div
                  key={index}
                  data-testid={`achievement-${index}`}
                  className="neumorphic-card p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                    <item.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-6">
              Join the Neural Revolution
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Interested in strategic partnerships, speaking engagements, or exploring how AI can transform your advertising strategy?
            </p>
            <Link
              to="/contact"
              data-testid="about-cta"
              data-hoverable="true"
              className="glow-button inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Start a Conversation
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default AboutPage;
