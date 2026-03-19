#!/bin/bash
# Build script for demoai.adsgupta.com
# Demo environment - Fully pre-loaded with mock data

echo "Building for demoai.adsgupta.com..."

# Set environment variables for demo domain
export REACT_APP_SHOW_DEMO=true
export REACT_APP_SITE_MODE=demo
export REACT_APP_DEMO_DOMAIN=https://demoai.adsgupta.com
export REACT_APP_TOOLS_DOMAIN=https://tools.adsgupta.com
export REACT_APP_BACKEND_URL=https://api.adsgupta.com

# Build the application
yarn build

# Output build info
echo ""
echo "===================================="
echo "Build Complete: demoai.adsgupta.com"
echo "===================================="
echo "Mode: Demo (Mock Data)"
echo "Demo Mode: ENABLED"
echo "Default Route: / -> /amazon-audit (Demo Universe)"
echo "15-Year Optimizer Logic: Active"
echo "Data Points: 1,400+ simulated"
echo "===================================="
