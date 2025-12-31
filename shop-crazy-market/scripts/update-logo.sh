#!/bin/bash

# Script to help update the logo and regenerate favicons

echo "🎨 Shop Crazy Market - Logo Update Script"
echo "=========================================="
echo ""

# Check if logo.png exists in public directory
LOGO_PATH="public/logo.png"

if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ logo.png not found at: $LOGO_PATH"
    echo ""
    echo "Please:"
    echo "1. Save your colorful 'Shop CRAZY Market' logo as logo.png"
    echo "2. Place it in the public/ directory"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Found logo.png"
echo ""

# Ask user if they want to regenerate favicons
read -p "Do you want to regenerate all favicon files? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Regenerating favicon files..."
    node scripts/generate-favicon.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "📁 Copying favicons to app directory..."
        cp public/favicon.ico app/favicon.ico
        cp public/favicon-32x32.png app/icon.png
        cp public/apple-touch-icon.png app/apple-icon.png
        echo "✅ Done! Favicons updated."
        echo ""
        echo "💡 Tip: Clear your browser cache and hard refresh (Ctrl+Shift+R) to see the new favicon"
    else
        echo "❌ Error generating favicons"
        exit 1
    fi
else
    echo "Skipped favicon regeneration"
fi

