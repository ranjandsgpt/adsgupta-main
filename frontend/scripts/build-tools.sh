#!/bin/bash
# Build script for tools.adsgupta.com
# Production environment - Real client data

echo "Building for tools.adsgupta.com..."

# Set environment variables for tools domain
export REACT_APP_SHOW_DEMO=false
export REACT_APP_SITE_MODE=tools
export REACT_APP_DEMO_DOMAIN=https://demoai.adsgupta.com
export REACT_APP_TOOLS_DOMAIN=https://tools.adsgupta.com
export REACT_APP_BACKEND_URL=https://api.adsgupta.com

# Build the application
yarn build

# Output build info
echo ""
echo "==================================="
echo "Build Complete: tools.adsgupta.com"
echo "==================================="
echo "Mode: Production (Real Data)"
echo "Demo Mode: DISABLED"
echo "Default Route: / -> Marketing Page"
echo "Audit Route: /audit -> Multi-File Instant Audit"
echo "==================================="
