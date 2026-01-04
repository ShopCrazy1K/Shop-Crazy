#!/bin/bash

echo "🔍 Vercel Deployment Diagnostic & Fix Script"
echo "============================================"
echo ""

cd "$(dirname "$0")/.." || exit 1

echo "📊 Checking Git Status..."
echo "Latest commits:"
git log --oneline -3
echo ""

echo "📦 Checking Project Structure..."
if [ -f "shop-crazy-market/package.json" ]; then
    echo "✅ shop-crazy-market/package.json found"
    echo "   Next.js app detected in shop-crazy-market/"
else
    echo "❌ shop-crazy-market/package.json NOT found"
    exit 1
fi

echo ""
echo "⚙️  Vercel Configuration Check..."
if [ -f "shop-crazy-market/vercel.json" ]; then
    echo "✅ shop-crazy-market/vercel.json exists"
    cat shop-crazy-market/vercel.json
else
    echo "⚠️  shop-crazy-market/vercel.json not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 LIKELY ISSUE: Vercel Root Directory"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your Next.js app is in: shop-crazy-market/"
echo "But Vercel might be looking in: . (root directory)"
echo ""
echo "✅ TO FIX:"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select your project"
echo "   3. Settings → General"
echo "   4. Find 'Root Directory'"
echo "   5. Set to: shop-crazy-market"
echo "   6. Save"
echo "   7. Redeploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Triggering new deployment now..."
echo ""

# Trigger deployment
bash shop-crazy-market/trigger-deployment-simple.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Verify Root Directory is set to: shop-crazy-market"
echo "3. If not, update it and manually redeploy"
echo "4. Watch deployment logs for errors"
echo ""
