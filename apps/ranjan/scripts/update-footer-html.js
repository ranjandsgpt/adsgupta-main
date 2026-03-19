#!/usr/bin/env node
/**
 * One-off: normalize the site footer to the canonical AdsGupta footer snippet.
 * Run from repo root: node scripts/update-footer-html.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const NEW_FOOTER = fs.readFileSync(path.join(ROOT, 'footer-canonical.html'), 'utf8');

// Match any footer that declares data-testid="footer-section"
const FOOTER_RE = /<footer[^>]*data-testid="footer-section"[\s\S]*?<\/footer>/;

function findHtmlFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.name === 'node_modules' || e.name === '.git') continue;
    if (e.isDirectory()) findHtmlFiles(full, list);
    else if (e.name === 'index.html') list.push(full);
  }
  return list;
}

const htmlFiles = findHtmlFiles(ROOT).filter((f) => {
  const rel = path.relative(ROOT, f);
  return !rel.startsWith('exchange' + path.sep);
});
let updated = 0;
for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('data-testid="footer-section"')) continue;
  if (!FOOTER_RE.test(content)) {
    console.warn('No footer match:', path.relative(ROOT, file));
    continue;
  }
  content = content.replace(FOOTER_RE, NEW_FOOTER);
  fs.writeFileSync(file, content);
  updated++;
  console.log('Updated:', path.relative(ROOT, file));
}
console.log('Done. Updated', updated, 'files.');