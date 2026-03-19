import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, TrendingUp } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '@adsgupta/ui';
import { ChatBot } from '../components/ChatBot';

const BlogPage = () => {
  const blogPosts = [
    {
      title: 'Authenticity: The Bedrock of Brand Building',
      category: 'Brand Strategy',
      excerpt: 'In an era of AI-generated content, authentic brand voices cut through the noise. Discover why genuine storytelling is your competitive advantage in the age of neural marketing.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      date: 'Dec 15, 2025',
      readTime: '8 min read',
      featured: true,
    },
    {
      title: 'The Rural Sakhi Effect: Reimagining OOH',
      category: 'Out-of-Home',
      excerpt: 'How grassroots brand ambassadors are transforming outdoor advertising in India\'s rural heartland. A deep dive into community-driven marketing.',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
      date: 'Dec 12, 2025',
      readTime: '6 min read',
      featured: true,
    },
    {
      title: 'Neural-Pathing: Predicting Consumer Intent Before Action',
      category: 'AI & Technology',
      excerpt: 'Our latest research into predictive consumer modeling. How neural networks anticipate desire before it manifests into search behavior.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      date: 'Dec 8, 2025',
      readTime: '10 min read',
      featured: false,
    },
    {
      title: 'The Amazon & Walmart Advantage: Retail-Trained AI',
      category: 'Retail Media',
      excerpt: 'Why AI models trained on retail data outperform generic advertising algorithms. Inside our Commerce Intel neural engine.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      date: 'Dec 5, 2025',
      readTime: '7 min read',
      featured: false,
    },
    {
      title: 'The Psychology of Choice in Modern Advertising',
      category: 'Consumer Psychology',
      excerpt: 'Understanding decision fatigue and how smart advertisers guide consumers through the paradox of choice with precision targeting.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      date: 'Dec 1, 2025',
      readTime: '7 min read',
      featured: false,
    },
    {
      title: 'From Wellness to Indulgence: The Consumer Pendulum',
      category: 'Trend Analysis',
      excerpt: 'The post-pandemic shift in consumer behavior and what it means for advertising strategies in 2026 and beyond.',
      image: 'https://images.unsplash.com/photo-1620555791739-438a95e7ff65?w=600&h=400&fit=crop',
      date: 'Nov 28, 2025',
      readTime: '5 min read',
      featured: false,
    },
  ];

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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
            className="mb-16"
          >
            <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Intelligence Feed
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-4">
              THE AD-ARCHIVES
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Deep dives into advertising strategy, retail media technology, and the psychology of modern marketing.
            </p>
          </motion.div>

          {/* Featured Posts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          >
            {featuredPosts.map((post, index) => (
              <motion.article
                key={index}
                data-testid={`featured-post-${index}`}
                className="blog-card group relative rounded-2xl overflow-hidden aspect-[16/10]"
                whileHover={{ y: -5 }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      Featured
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] leading-tight mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                    {post.title}
                  </h2>
                  <p className="text-zinc-300 text-sm md:text-base mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-zinc-400 text-sm">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-8 overflow-x-auto pb-2"
          >
            <span className="text-zinc-500 text-sm flex items-center gap-2 whitespace-nowrap">
              <TrendingUp size={14} />
              Trending:
            </span>
            {['Retail Media', 'Neural Targeting', 'Amazon Ads', 'Influencer ROI', 'OOH Innovation'].map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-cyan-500/30 cursor-pointer transition-all whitespace-nowrap"
              >
                {topic}
              </span>
            ))}
          </motion.div>

          {/* All Posts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] mb-8">All Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={index}
                  data-testid={`blog-post-${index}`}
                  className="glass-card group rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-zinc-300">
                        {post.category}
                      </span>
                      <span className="text-xs text-zinc-500">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] leading-tight mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                      <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Read</span>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default BlogPage;
