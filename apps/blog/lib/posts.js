import 'server-only'
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * Get all post slugs (filename without .md).
 * @returns {string[]}
 */
export function getSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''));
}

/**
 * Get post data by slug. Parses frontmatter and converts markdown to HTML.
 * For use in server components only (uses Node APIs).
 * @param {string} slug
 * @returns {Promise<{ slug: string, title: string, date: string, description: string, contentHtml: string }>}
 */
export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processed = await remark()
    .use(remarkHtml)
    .process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    description: data.description ?? '',
    contentHtml,
  };
}

/**
 * Get all posts with frontmatter only, sorted by date descending.
 * For use in server components only (uses Node APIs).
 * @returns {{ slug: string, title: string, date: string, description: string }[]}
 */
export function getAllPosts() {
  const slugs = getSlugs();
  const posts = slugs.map((slug) => {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug,
      title: data.title ?? '',
      date: data.date ?? '',
      description: data.description ?? '',
    };
  });

  return posts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
}
