#!/bin/bash

echo "🍎 Clearing Safari Favicon Cache..."
echo "===================================="
echo ""

# Check if Safari is running
if pgrep -x "Safari" > /dev/null; then
    echo "⚠️  Safari is running. Please quit Safari first (Cmd+Q)"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Safari is not running. Proceeding..."
echo ""

# Clear favicon cache
echo "🗑️  Clearing favicon cache..."
rm -rf ~/Library/Safari/Favicon\ Cache/* 2>/dev/null
echo "   ✅ Favicon cache cleared"

# Clear touch icons cache
echo "🗑️  Clearing touch icons cache..."
rm -rf ~/Library/Safari/Touch\ Icons\ Cache/* 2>/dev/null
echo "   ✅ Touch icons cache cleared"

# Clear website icons
echo "🗑️  Clearing website icons..."
rm -rf ~/Library/Safari/Website\ Icons/* 2>/dev/null
echo "   ✅ Website icons cleared"

# Clear Safari caches
echo "🗑️  Clearing Safari caches..."
rm -rf ~/Library/Caches/com.apple.Safari/* 2>/dev/null
echo "   ✅ Safari caches cleared"

echo ""
echo "✅ All Safari favicon caches cleared!"
echo ""
echo "📝 Next steps:"
echo "   1. Open Safari"
echo "   2. Go to: https://shopcrazymarket.com"
echo "   3. Press Cmd + Shift + R (hard refresh)"
echo "   4. Your favicon should now appear! 🎉"
echo ""

