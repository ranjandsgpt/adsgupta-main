import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BlogPreview = () => {
  const blogPosts = [
    {
      title: 'Authenticity: The Bedrock of Brand Building',
      category: 'Strategy',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      date: 'Dec 2025',
    },
    {
      title: 'Neural-Pathing: Predicting Consumer Intent Before Action',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      date: 'Dec 2025',
    },
    {
      title: 'The Amazon & Walmart Advantage: Retail-Trained AI',
      category: 'Retail Media',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
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
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
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
          <motion.div whileHover={{ x: 5 }}>
            <Link
              to="/blog"
              data-testid="view-all-blog-link"
              data-hoverable="true"
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 font-medium"
            >
              View All Posts
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
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
            <motion.div
              key={index}
              variants={cardVariants}
              data-testid={`blog-card-${index}`}
            >
              <Link
                to="/blog"
                data-hoverable="true"
                className="blog-card group rounded-2xl overflow-hidden aspect-[4/5] relative block"
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
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogPreview;
