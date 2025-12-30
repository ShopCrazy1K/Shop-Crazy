#!/bin/bash

# Script to generate app icons from logo.png
# Requires ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)

LOGO_PATH="public/logo.png"
ICONS_DIR="public/icons"
SPLASH_DIR="public/splash"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "Install it with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    exit 1
fi

# Check if logo exists
if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ Logo not found at $LOGO_PATH"
    echo "Please ensure logo.png exists in the public directory"
    exit 1
fi

# Create directories
mkdir -p "$ICONS_DIR"
mkdir -p "$SPLASH_DIR"

echo "🖼️  Generating app icons from $LOGO_PATH..."

# Generate iOS icons
convert "$LOGO_PATH" -resize 57x57 "$ICONS_DIR/icon-57x57.png"
convert "$LOGO_PATH" -resize 60x60 "$ICONS_DIR/icon-60x60.png"
convert "$LOGO_PATH" -resize 72x72 "$ICONS_DIR/icon-72x72.png"
convert "$LOGO_PATH" -resize 76x76 "$ICONS_DIR/icon-76x76.png"
convert "$LOGO_PATH" -resize 96x96 "$ICONS_DIR/icon-96x96.png"
convert "$LOGO_PATH" -resize 114x114 "$ICONS_DIR/icon-114x114.png"
convert "$LOGO_PATH" -resize 120x120 "$ICONS_DIR/icon-120x120.png"
convert "$LOGO_PATH" -resize 128x128 "$ICONS_DIR/icon-128x128.png"
convert "$LOGO_PATH" -resize 144x144 "$ICONS_DIR/icon-144x144.png"
convert "$LOGO_PATH" -resize 152x152 "$ICONS_DIR/icon-152x152.png"
convert "$LOGO_PATH" -resize 180x180 "$ICONS_DIR/icon-180x180.png"
convert "$LOGO_PATH" -resize 192x192 "$ICONS_DIR/icon-192x192.png"
convert "$LOGO_PATH" -resize 384x384 "$ICONS_DIR/icon-384x384.png"
convert "$LOGO_PATH" -resize 512x512 "$ICONS_DIR/icon-512x512.png"

echo "✅ App icons generated successfully!"
echo "📁 Icons saved to: $ICONS_DIR"
echo ""
echo "⚠️  Note: Splash screens need to be created manually or using a tool like:"
echo "   https://appsco.pe/developer/splash-screens"
echo ""
echo "Required splash screen sizes:"
echo "  - iPhone 6/7/8: 750x1334px → $SPLASH_DIR/iphone-6-7-8.png"
echo "  - iPhone 6/7/8 Plus: 1242x2208px → $SPLASH_DIR/iphone-6-7-8-plus.png"
echo "  - iPhone X/XS: 1125x2436px → $SPLASH_DIR/iphone-x-xs.png"
echo "  - iPhone XR: 828x1792px → $SPLASH_DIR/iphone-xr.png"
echo "  - iPhone XS Max: 1242x2688px → $SPLASH_DIR/iphone-xs-max.png"
echo "  - iPad: 1536x2048px → $SPLASH_DIR/ipad.png"
echo "  - iPad Pro: 2048x2732px → $SPLASH_DIR/ipad-pro.png"

