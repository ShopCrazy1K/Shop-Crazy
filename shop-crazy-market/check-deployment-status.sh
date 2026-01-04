#!/bin/bash

echo "🔍 Deployment Status Checker"
echo "============================"
echo ""

cd "$(dirname "$0")" || exit 1

echo "📊 Recent Commits:"
git log --oneline -5
echo ""

echo "📦 Files Changed in Recent Commits:"
git diff HEAD~5 --name-only | grep -E "(components|app)" | head -10
echo ""

echo "🔍 Checking NotificationBell.tsx:"
if grep -q "inline-flex items-center" components/NotificationBell.tsx 2>/dev/null; then
    echo "✅ Latest layout fix is in the code"
else
    echo "❌ Latest layout fix NOT found in code"
fi

echo ""
echo "🔍 Checking Navbar.tsx:"
if grep -q "<NotificationBell />" components/Navbar.tsx 2>/dev/null && ! grep -q "flex items-center gap-2" components/Navbar.tsx 2>/dev/null; then
    echo "✅ Navbar layout fix is in the code (extra wrapper removed)"
else
    echo "❌ Navbar layout fix may not be applied"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 CRITICAL: Vercel Configuration Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your code changes ARE in GitHub, but if they're not appearing"
echo "on your live site, the issue is Vercel configuration:"
echo ""
echo "✅ DO THIS NOW:"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select your project"
echo "   3. Settings → General → Root Directory"
echo "   4. MUST be set to: shop-crazy-market"
echo "   5. If it's not, change it and save"
echo "   6. Then manually redeploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
