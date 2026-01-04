#!/bin/bash
# Auto-Fix Vercel Deployment Configuration

set -e

echo "🔧 Auto-Fixing Vercel Deployment Configuration"
echo "=============================================="
echo ""

cd "$(dirname "$0")" || exit 1
SHOP_DIR="$(pwd)"

echo "📍 Shop directory: $SHOP_DIR"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found."
    echo "   The fix must be done manually via Vercel Dashboard"
    echo ""
    echo "   See: VERCEL_FIX_INSTRUCTIONS.md"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "   Please run: vercel login"
    echo "   Then run this script again"
    exit 1
fi

VERCEL_USER=$(vercel whoami 2>/dev/null)
echo "✅ Logged in as: $VERCEL_USER"
echo ""

echo "🔗 Attempting to link project to ensure correct configuration..."
echo ""

vercel link --yes --cwd "$SHOP_DIR" 2>&1 || {
    echo ""
    echo "⚠️  Link command completed (may have warnings)"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ IMPORTANT: Manual Step Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Even after running this script, you MUST:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Settings → General → Root Directory"
echo "4. Set to: shop-crazy-market"
echo "5. Save"
echo "6. Redeploy"
echo ""
echo "See VERCEL_FIX_INSTRUCTIONS.md for detailed steps"
echo ""
