#!/bin/bash

# Helper script to push with Personal Access Token

echo "🔑 GitHub Personal Access Token Push Helper"
echo ""
echo "If you haven't created a token yet:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Name: 'Shop-Crazy Deploy'"
echo "4. Check 'repo' scope"
echo "5. Generate and copy the token"
echo ""
read -p "Enter your GitHub Personal Access Token: " TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ Token is required!"
  exit 1
fi

echo ""
echo "🔄 Pushing to GitHub..."

# Update remote URL with token
git remote set-url origin https://${TOKEN}@github.com/ShopCrazy1K/Shop-Crazy.git

# Push
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Go to Vercel: https://vercel.com/shop-crazy-markets-projects/social-app/settings/git"
  echo "2. Connect repository: ShopCrazy1K/Shop-Crazy"
  echo "3. Set Root Directory: shop-crazy-market"
  echo "4. Deploy!"
else
  echo ""
  echo "❌ Push failed. Check your token and try again."
fi

