import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = {
  title: 'Blog',
  description: 'All blog posts',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <h1>Blog</h1>
      <ul style={listStyle}>
        {posts.map((post) => (
          <li key={post.slug} style={itemStyle}>
            <Link href={`/blog/${post.slug}`} style={linkStyle}>
              {post.title}
            </Link>
            <span style={dateStyle}>{post.date}</span>
            {post.description && (
              <p style={descStyle}>{post.description}</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
const itemStyle = { marginBottom: '1.5rem' };
const linkStyle = { color: '#333', textDecoration: 'none', fontWeight: '600' };
const dateStyle = { display: 'block', fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' };
const descStyle = { margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#555' };
