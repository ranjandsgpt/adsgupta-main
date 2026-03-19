export const runtime = "nodejs";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSlugs, getPostBySlug } from '@/lib/posts';

export async function generateStaticParams() {
  const slugs = getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }) {
  let post;
  try {
    post = await getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <article>
      <p style={backStyle}>
        <Link href="/blog">← Back to blog</Link>
      </p>
      <h1 style={titleStyle}>{post.title}</h1>
      <time style={dateStyle} dateTime={post.date}>
        {post.date}
      </time>
      <div
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}

const backStyle = { marginBottom: '1rem' };
const titleStyle = { marginBottom: '0.25rem' };
const dateStyle = { display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' };
const contentStyle = {
  lineHeight: 1.7,
  fontSize: '1rem',
};
