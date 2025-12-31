#!/bin/bash

# One-command script to update favicon from logo.png
# Usage: ./scripts/update-favicon.sh

set -e  # Exit on error

echo "🎨 Shop Crazy Market - Favicon Update Script"
echo "============================================"
echo ""

# Change to project root
cd "$(dirname "$0")/.."

# Check if logo.png exists
LOGO_PATH="public/logo.png"

if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ Error: logo.png not found at: $LOGO_PATH"
    echo ""
    echo "Please:"
    echo "1. Save your colorful 'Shop CRAZY Market' logo as logo.png"
    echo "2. Place it in the public/ directory"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Found logo.png"
echo ""

# Regenerate all favicon files
echo "🔄 Step 1: Regenerating favicon files from logo..."
node scripts/generate-favicon.js

if [ $? -ne 0 ]; then
    echo "❌ Error generating favicons"
    exit 1
fi

echo ""
echo "📁 Step 2: Copying favicons to app directory..."

# Copy favicons to app directory
cp public/favicon.ico app/favicon.ico
cp public/favicon-32x32.png app/icon.png
cp public/apple-touch-icon.png app/apple-icon.png

echo "✅ Copied favicon.ico to app/favicon.ico"
echo "✅ Copied favicon-32x32.png to app/icon.png"
echo "✅ Copied apple-touch-icon.png to app/apple-icon.png"

echo ""
echo "🎉 All done! Favicons have been updated."
echo ""
echo "💡 Next steps:"
echo "   1. Clear your browser cache"
echo "   2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   3. The new favicon should appear in browser tabs!"
echo ""

