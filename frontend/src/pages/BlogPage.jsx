import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { ChatBot } from '../components/ChatBot';

const BlogPage = () => {
  const blogPosts = [
    {
      title: 'Authenticity: The Bedrock of Brand Building',
      category: 'Brand Strategy',
      excerpt: 'In an era of AI-generated content, authentic brand voices cut through the noise. Discover why genuine storytelling is your competitive advantage.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      date: 'Dec 15, 2025',
      readTime: '8 min read',
      featured: true,
    },
    {
      title: 'The Rural Sakhi Effect: Reimagining OOH',
      category: 'Out-of-Home',
      excerpt: 'How grassroots brand ambassadors are transforming outdoor advertising in India\'s rural heartland.',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
      date: 'Dec 12, 2025',
      readTime: '6 min read',
      featured: true,
    },
    {
      title: 'From Wellness to Indulgence',
      category: 'Consumer Trends',
      excerpt: 'The pendulum swings: understanding the post-pandemic shift in consumer behavior and advertising strategies.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      date: 'Dec 8, 2025',
      readTime: '5 min read',
      featured: false,
    },
    {
      title: 'Why 2026 is the Year of Neural Commerce',
      category: 'Technology',
      excerpt: 'AI-driven advertising is evolving. Here\'s how neural networks will reshape the commerce landscape.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      date: 'Dec 5, 2025',
      readTime: '10 min read',
      featured: false,
    },
    {
      title: 'The Psychology of Choice in Modern Advertising',
      category: 'Strategy',
      excerpt: 'Understanding decision fatigue and how smart advertisers guide consumers through the paradox of choice.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      date: 'Dec 1, 2025',
      readTime: '7 min read',
      featured: false,
    },
    {
      title: 'Neural-Pathing: How AI Predicts Consumer Desire',
      category: 'AI & ML',
      excerpt: 'A deep dive into the algorithms that anticipate what consumers want before they know it themselves.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop',
      date: 'Nov 28, 2025',
      readTime: '9 min read',
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
              THE ARCHIVES
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Deep dives into advertising strategy, technology, and the psychology of modern marketing.
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
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Read More</span>
                      <ArrowUpRight size={14} />
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
