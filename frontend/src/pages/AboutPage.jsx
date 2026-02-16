import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Award, TrendingUp, Users, Globe } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const AboutPage = () => {
  const achievements = [
    {
      icon: Award,
      title: 'Britannia Industries',
      description: 'General Manager - Spearheaded digital transformation initiatives',
    },
    {
      icon: TrendingUp,
      title: '15+ Years Experience',
      description: 'Deep expertise across FMCG, retail, and digital advertising',
    },
    {
      icon: Users,
      title: 'Team Leadership',
      description: 'Built and scaled high-performance marketing teams',
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-card">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop"
                  alt="Professional headshot"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-500/20 rounded-2xl blur-2xl" />
            </motion.div>

            {/* Right: Bio */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4">
                Leadership
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-6 leading-tight">
                Building the Future of<br />
                <span className="text-cyan-400">Neural Advertising</span>
              </h1>
              
              <div className="space-y-4 text-zinc-400 text-base md:text-lg leading-relaxed mb-8">
                <p>
                  With over 15 years of experience shaping brand narratives at the intersection of consumer psychology and technology, I've witnessed firsthand the evolution of advertising from traditional media to AI-driven neural networks.
                </p>
                <p>
                  As former General Manager at Britannia Industries, I led cross-functional teams in delivering campaigns that reached over 500 million consumers. My experience spans FMCG marketing, retail strategy, and digital transformation across India's most diverse markets.
                </p>
                <p>
                  Ads Gupta represents the culmination of these insights—a platform that leverages artificial intelligence to predict consumer desire before it manifests, enabling advertisers to connect with audiences at the speed of thought.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="#"
                  data-testid="about-linkedin"
                  data-hoverable="true"
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Linkedin size={20} strokeWidth={1.5} />
                </motion.a>
                <motion.a
                  href="#"
                  data-testid="about-twitter"
                  data-hoverable="true"
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Twitter size={20} strokeWidth={1.5} />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Achievements Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] mb-8 text-center">
              Professional Milestones
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
            transition={{ duration: 0.6 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Space_Grotesk'] mb-6">
              Let's Build the Future Together
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Interested in strategic partnerships, speaking engagements, or exploring how AI can transform your advertising strategy?
            </p>
            <Link
              to="/contact"
              data-testid="about-cta"
              data-hoverable="true"
              className="glow-button inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Start a Conversation
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
