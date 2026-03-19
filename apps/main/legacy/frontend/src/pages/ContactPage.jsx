import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone, Building, User, Briefcase, MessageSquare } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    partnershipType: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const partnershipTypes = [
    'Strategic Alliance',
    'Technology Integration',
    'Agency Partnership',
    'Speaking Engagement',
    'Investment Inquiry',
    'Media & Press',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', company: '', partnershipType: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'partnerships@adsgupta.com',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Mumbai, India',
    },
    {
      icon: Phone,
      label: 'Response Time',
      value: 'Within 24 hours',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] relative">
      <div className="grain-overlay" />
      <Navigation />
      <MobileNav />
      
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Connect
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
              STRATEGIC PARTNERSHIPS
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Let's explore how we can collaborate to shape the future of AI-driven advertising.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info - Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-6">
                  Get in Touch
                </h2>
                <p className="text-zinc-400 leading-relaxed">
                  Whether you're exploring partnership opportunities, seeking technology integration, or interested in speaking engagements, we're here to discuss how Ads Gupta can add value to your ecosystem.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <item.icon size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-sm mb-1">{item.label}</p>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white font-['Space_Grotesk'] mb-4">
                  Partnership Areas
                </h3>
                <ul className="space-y-3 text-zinc-400 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Publishers & SSPs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Agencies & Trading Desks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    E-commerce Platforms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Technology Integrations
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form - Right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="glass-card rounded-2xl p-8 md:p-10">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                      <Send size={32} className="text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-zinc-400">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2 font-medium">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            name="name"
                            data-testid="contact-name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2 font-medium">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="email"
                            name="email"
                            data-testid="contact-email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@company.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company & Partnership Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2 font-medium">
                          Company / Organization
                        </label>
                        <div className="relative">
                          <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            name="company"
                            data-testid="contact-company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Company name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2 font-medium">
                          Partnership Type *
                        </label>
                        <div className="relative">
                          <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <select
                            name="partnershipType"
                            data-testid="contact-partnership"
                            value={formData.partnershipType}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                          >
                            <option value="" className="bg-[#121212]">Select type</option>
                            {partnershipTypes.map((type) => (
                              <option key={type} value={type} className="bg-[#121212]">
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2 font-medium">
                        Message *
                      </label>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-4 top-4 text-zinc-500" />
                        <textarea
                          name="message"
                          data-testid="contact-message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="Tell us about your partnership goals and how we can collaborate..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      data-testid="contact-submit"
                      data-hoverable="true"
                      className="glow-button w-full flex items-center justify-center gap-2 bg-cyan-500 text-black py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-cyan-400 transition-colors duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Send size={18} />
                      Send Message
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default ContactPage;
