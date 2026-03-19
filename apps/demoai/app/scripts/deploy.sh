#!/usr/bin/env bash
# Deploy demoai.adsgupta.com (Monetization Lab v3.2) to Vercel
# Run from repo root or from app/: ./scripts/deploy.sh

set -e
cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Building for production..."
npm run build

if command -v vercel &>/dev/null; then
  echo "Deploying to Vercel (project: adsgupta-demoai)..."
  vercel --prod
else
  echo "Vercel CLI not found. Options:"
  echo "  1. Push to GitHub — Vercel will auto-deploy if the repo is connected."
  echo "  2. Install Vercel CLI: npm i -g vercel"
  echo "  3. Then run: vercel --prod"
  echo ""
  echo "Build completed. Output is in dist/"
fi
