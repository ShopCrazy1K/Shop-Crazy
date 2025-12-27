#!/bin/bash

echo "🔍 Checking deployment status..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in the project root?"
  exit 1
fi

echo "✅ Project structure looks good"
echo ""

# Check git status
echo "📦 Git Status:"
git status --short
echo ""

# Check recent commits
echo "📝 Recent commits:"
git log --oneline -5
echo ""

# Check if pushed
echo "🌐 Remote status:"
git log origin/main..HEAD --oneline 2>/dev/null || echo "All commits pushed"
echo ""

# Check build locally
echo "🔨 Testing build locally..."
if npm run build > /tmp/build-test.log 2>&1; then
  echo "✅ Local build successful"
else
  echo "❌ Local build failed. Check /tmp/build-test.log"
  cat /tmp/build-test.log | tail -20
  exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Check Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Verify DATABASE_URL is set in Vercel environment variables"
echo "3. Check deployment logs for any errors"
echo "4. If no deployment triggered, try: git commit --allow-empty -m 'Trigger deploy' && git push"

