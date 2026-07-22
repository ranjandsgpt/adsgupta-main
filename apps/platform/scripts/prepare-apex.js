#!/usr/bin/env node
/**
 * Prepare apps/platform as the adsgupta.com apex deploy:
 * build the CRA marketing site and copy it into public/ so `/` stays the
 * landing page while `/platform/*` is served by Next.js.
 *
 * Set SKIP_MARKETING_BUILD=1 to build platform-only (e.g. legacy platform-adsgupta).
 */
const { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');
const { dirname, resolve } = require('path');

const platformRoot = resolve(__dirname, '..');
const frontendRoot = resolve(platformRoot, '../main/frontend');
const publicDir = resolve(platformRoot, 'public');
const buildDir = resolve(frontendRoot, 'build');

if (process.env.SKIP_MARKETING_BUILD === '1' || process.env.SKIP_MARKETING_BUILD === 'true') {
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(resolve(publicDir, '.gitkeep'), '');
  console.log('[prepare-apex] SKIP_MARKETING_BUILD set — leaving public/ empty');
  process.exit(0);
}

if (!existsSync(resolve(frontendRoot, 'package.json'))) {
  console.error('[prepare-apex] Missing apps/main/frontend — cannot embed marketing site');
  process.exit(1);
}

console.log('[prepare-apex] Installing marketing frontend deps…');
execSync('npm install --legacy-peer-deps', {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: process.env,
});

console.log('[prepare-apex] Building marketing CRA…');
execSync('npm run build', {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: { ...process.env, CI: 'true', GENERATE_SOURCEMAP: 'false' },
});

if (!existsSync(resolve(buildDir, 'index.html'))) {
  console.error('[prepare-apex] CRA build did not produce build/index.html');
  process.exit(1);
}

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
cpSync(buildDir, publicDir, { recursive: true });
console.log('[prepare-apex] Copied marketing build → apps/platform/public');
