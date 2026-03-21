#!/usr/bin/env bash
# Deploy blog frontend to Vercel. Run from repo root.
# Requires: Node, npm (or yarn), and optionally Vercel CLI (npm i -g vercel).

set -e
cd "$(dirname "$0")/frontend"

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

if command -v vercel &>/dev/null; then
  echo "Deploying to Vercel..."
  vercel --prod
else
  echo "Build finished. To deploy:"
  echo "  1. Push to GitHub and connect repo at vercel.com/new (Root Directory: frontend), or"
  echo "  2. Install Vercel CLI: npm i -g vercel && vercel login && vercel --prod"
fi
