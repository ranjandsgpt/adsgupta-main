/**
 * SQLite database for AdsGupta BlogAI CMS.
 * Tables: users, posts, monetization, sessions.
 * Default admin is inserted on first init.
 */

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), ".data");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const dbPath = path.join(dir, "adsgupta-blog.db");

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  initSchema(_db);
  return _db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      category TEXT,
      source TEXT,
      external_url TEXT,
      publish_date TEXT,
      reading_time INTEGER,
      status TEXT DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS monetization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      script TEXT NOT NULL,
      position TEXT DEFAULT 'after_paragraph_3',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON posts(publish_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);

  try {
    db.exec("ALTER TABLE posts ADD COLUMN featured INTEGER DEFAULT 0");
  } catch (_) {}

  const adminExists = db.prepare("SELECT 1 FROM users WHERE email = ?").get("ranjan@adsgupta.com");
  if (!adminExists) {
    const hash = bcrypt.hashSync("ranjan@123", 10);
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run("ranjan@adsgupta.com", hash);
  }
}

export function getDatabase() {
  return getDb();
}

export function getAdminUser() {
  return getDb().prepare("SELECT id, email FROM users WHERE email = ?").get("ranjan@adsgupta.com");
}

export function getPostBySlug(slug) {
  const row = getDb().prepare("SELECT * FROM posts WHERE slug = ?").get(slug);
  return row ? rowToPost(row) : null;
}

export function getPostById(id) {
  const row = getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id);
  return row ? rowToPost(row) : null;
}

export function getAllPosts(opts = {}) {
  const { status = "published", limit, category } = opts;
  let sql = "SELECT * FROM posts WHERE status = ?";
  const params = [status];
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY publish_date DESC, id DESC";
  if (limit) {
    sql += " LIMIT ?";
    params.push(limit);
  }
  const rows = getDb().prepare(sql).all(...params);
  return rows.map(rowToPost);
}

export function getAllPostsForAdmin(opts = {}) {
  const { category, source, status } = opts;
  let sql = "SELECT * FROM posts WHERE 1=1";
  const params = [];
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (source) {
    sql += " AND source = ?";
    params.push(source);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY updated_at DESC";
  const rows = getDb().prepare(sql).all(...params);
  return rows.map(rowToPost);
}

export function searchPosts(q) {
  if (!q || !String(q).trim()) return [];
  const term = "%" + String(q).trim().replace(/%/g, "\\%") + "%";
  const rows = getDb()
    .prepare(
      "SELECT * FROM posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?) ORDER BY publish_date DESC LIMIT 50"
    )
    .all(term, term, term);
  return rows.map(rowToPost);
}

export function getPostSlugs() {
  const rows = getDb().prepare("SELECT slug FROM posts WHERE status = 'published'").all();
  return rows.map((r) => ({ slug: r.slug }));
}

function rowToPost(row) {
  const words = (row.content || "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    contentHtml: null,
    excerpt: row.excerpt || (row.content || "").replace(/\s+/g, " ").trim().slice(0, 160) + "…",
    meta: {
      title: row.title,
      description: row.excerpt || row.title,
      date: row.publish_date,
      category: row.category,
      source: row.source || "AdsGupta",
      author: "AdsGupta",
      ogTitle: row.title,
      ogDescription: row.excerpt || row.title,
      ogImage: null,
      showCta: true,
      ctaLabel: "Run your audit on DemoAI",
      ctaUrl: "https://demoai.adsgupta.com",
    },
    readingTime: { minutes, text: `${minutes} min read` },
    source: row.source,
    category: row.category,
    status: row.status,
    publish_date: row.publish_date,
    reading_time: row.reading_time,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function createPost(data) {
  const slug = data.slug || slugify(data.title);
  const words = (data.content || "").split(/\s+/).filter(Boolean).length;
  const reading_time = Math.max(1, Math.ceil(words / 220));
  getDb()
    .prepare(
      `INSERT INTO posts (title, slug, content, excerpt, source, category, external_url, publish_date, status, reading_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.title || "",
      slug,
      data.content || "",
      data.excerpt || "",
      data.source || "AdsGupta",
      data.category || "",
      data.external_url || "",
      data.publish_date || null,
      data.status || "draft",
      reading_time
    );
  return getDb().prepare("SELECT last_insert_rowid() as id").get().id;
}

export function updatePost(id, data) {
  const words = (data.content || "").split(/\s+/).filter(Boolean).length;
  const reading_time = Math.max(1, Math.ceil(words / 220));
  getDb()
    .prepare(
      `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, source=?, category=?, external_url=?, publish_date=?, status=?, reading_time=?, updated_at=datetime('now')
       WHERE id = ?`
    )
    .run(
      data.title,
      data.slug,
      data.content,
      data.excerpt || "",
      data.source || "",
      data.category || "",
      data.external_url || "",
      data.publish_date || null,
      data.status || "draft",
      reading_time,
      id
    );
  return id;
}

export function deletePost(id) {
  return getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function getMonetizationScripts() {
  const rows = getDb().prepare("SELECT * FROM monetization ORDER BY id").all();
  return rows;
}

export function setMonetizationScript(script, position = "after_paragraph_3") {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM monetization LIMIT 1").get();
  if (existing) {
    db.prepare("UPDATE monetization SET script = ?, position = ? WHERE id = ?").run(script, position, existing.id);
    return existing.id;
  }
  db.prepare("INSERT INTO monetization (script, position) VALUES (?, ?)").run(script, position);
  return db.prepare("SELECT last_insert_rowid() as id").get().id;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
