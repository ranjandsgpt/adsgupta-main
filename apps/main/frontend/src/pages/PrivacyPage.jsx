import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Cpu, Eye, Lock, Server, Globe, ChevronRight } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import PersistentSLMChat from '../components/PersistentSLMChat';

const PrivacyPage = () => {
  const keyPrinciples = [
    {
      icon: Cpu,
      title: 'Local SLM Processing',
      description: 'Our AI chatbot uses browser-based Small Language Models (Gemini Nano). Your conversations are processed entirely on your device — no data is sent to external servers.',
    },
    {
      icon: Shield,
      title: 'Privacy-First Ad Serving',
      description: 'Our ad stack (GAM/TAM/Prebid) follows 2026 privacy standards. Contextual targeting replaces invasive tracking. Your browsing history stays yours.',
    },
    {
      icon: Lock,
      title: 'Edge Computing Architecture',
      description: 'Critical computations happen at the edge — on your device or the nearest node. This minimizes data exposure and maximizes performance.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium tracking-widest uppercase">
                Privacy & Compliance
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
              Your Data, Your Control
            </h1>
            <p className="text-zinc-400 text-lg">
              How AdsGupta protects your privacy through edge computing and local AI processing.
            </p>
            <p className="text-zinc-600 text-sm mt-2">
              Last updated: February 2026
            </p>
          </motion.div>

          {/* Key Principles Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
          >
            {keyPrinciples.map((principle, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                  <principle.icon size={20} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{principle.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Detailed Policy Sections */}
          <div className="space-y-12 text-zinc-300">
            {/* Section 1 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Eye size={16} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  1. Information We Collect
                </h2>
              </div>
              <div className="pl-11 space-y-4">
                <p className="leading-relaxed">
                  We collect minimal information necessary to provide our services:
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Account Data:</strong> Email and authentication tokens (if you create an account)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Usage Analytics:</strong> Anonymized page views and feature usage (no personal identifiers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Uploaded Files:</strong> Amazon reports for audit analysis (processed and deleted within 24 hours)</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Section 2 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Cpu size={16} className="text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  2. Local SLM & Edge Processing
                </h2>
              </div>
              <div className="pl-11 space-y-4">
                <p className="leading-relaxed">
                  Our AI assistant uses Chrome's built-in Small Language Model (Gemini Nano) when available:
                </p>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-emerald-400">✓ On-Device Processing:</strong> Conversations with the Neural Assistant are processed entirely within your browser. No conversation data is transmitted to our servers.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-amber-400">⚠ Fallback Mode:</strong> If your browser doesn't support SLM, we use pre-defined responses. No external AI API calls are made with your personal data.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Section 3 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Server size={16} className="text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  3. Ad Serving & GAM/TAM/Prebid Transparency
                </h2>
              </div>
              <div className="pl-11 space-y-4">
                <p className="leading-relaxed">
                  Our advertising technology stack follows strict privacy guidelines:
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Contextual Targeting:</strong> Ads are served based on page content, not your browsing history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">No Cross-Site Tracking:</strong> We don't use third-party cookies or fingerprinting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Header Bidding Compliance:</strong> Our Prebid.js implementation adheres to IAB TCF 2.2 and GPP standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Publisher Control:</strong> All ad rendering respects user consent signals and regional regulations</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Section 4 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Globe size={16} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  4. 2026 Data Privacy Standards
                </h2>
              </div>
              <div className="pl-11 space-y-4">
                <p className="leading-relaxed">
                  We comply with the latest global privacy regulations:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { region: 'EU', standard: 'GDPR + AI Act' },
                    { region: 'US', standard: 'CCPA + State Laws' },
                    { region: 'India', standard: 'DPDP Act 2023' },
                    { region: 'Global', standard: 'ISO 27701' },
                  ].map((item, i) => (
                    <div key={i} className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-emerald-400 text-xs font-bold">{item.region}</span>
                      <p className="text-white text-sm">{item.standard}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Section 5 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Lock size={16} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  5. Your Rights
                </h2>
              </div>
              <div className="pl-11 space-y-4">
                <p className="leading-relaxed">
                  You have full control over your data:
                </p>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Access:</strong> Request a copy of any data we hold about you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Delete:</strong> Request permanent deletion of your account and data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Portability:</strong> Export your data in machine-readable format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                    <span><strong className="text-white">Opt-Out:</strong> Disable analytics and personalization at any time</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Contact */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/5 border border-cyan-500/20"
            >
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-4">
                Privacy Inquiries
              </h2>
              <p className="text-zinc-400 mb-4">
                For any privacy-related questions or to exercise your rights, contact our Data Protection Officer:
              </p>
              <a
                href="mailto:privacy@adsgupta.com"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                privacy@adsgupta.com
              </a>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
      <PersistentSLMChat />
    </div>
  );
};

export default PrivacyPage;
