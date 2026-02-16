import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const BlogPreview = () => {
  const blogPosts = [
    {
      title: 'The Psychology of Choice in Modern Advertising',
      category: 'Strategy',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      date: 'Dec 2025',
    },
    {
      title: 'Neural-Pathing: How AI Predicts Consumer Desire',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      date: 'Dec 2025',
    },
    {
      title: 'If I Was Born As An Ad: A Creative Manifesto',
      category: 'Editorial',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop',
      date: 'Dec 2025',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
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

  return (
    <section
      id="blog"
      data-testid="blog-section"
      className="relative py-24 md:py-32"
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
              Intelligence Feed
            </span>
            <h2 className="section-title text-white">THE AD-ARCHIVES</h2>
          </div>
          <motion.a
            href="https://blog.adsgupta.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="view-all-blog-link"
            data-hoverable="true"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 font-medium"
            whileHover={{ x: 5 }}
          >
            View All Posts
            <ArrowUpRight size={18} />
          </motion.a>
        </motion.div>

        {/* Blog Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {blogPosts.map((post, index) => (
            <motion.a
              key={index}
              href="https://blog.adsgupta.com"
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              data-testid={`blog-card-${index}`}
              data-hoverable="true"
              className="blog-card group rounded-2xl overflow-hidden aspect-[4/5] relative"
              whileHover={{ y: -5 }}
            >
              {/* Image */}
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Content Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white">
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-400">{post.date}</span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white font-['Space_Grotesk'] leading-tight group-hover:text-cyan-400 transition-colors duration-300">
                  {post.title}
                </h3>

                <div className="mt-4 flex items-center gap-2 text-zinc-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Read Article</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogPreview;
