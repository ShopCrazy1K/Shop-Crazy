#!/bin/bash

echo "🚀 Vercel Setup Script"
echo "======================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
  echo "❌ Error: Vercel CLI not found. Install it with: npm i -g vercel"
  exit 1
fi

echo "📋 This script will:"
echo "1. Log you into Vercel (opens browser)"
echo "2. Link this project to Vercel"
echo "3. Set up the deployment"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

# Step 1: Login to Vercel
echo ""
echo "🔐 Step 1: Logging into Vercel..."
echo "A browser window will open for authentication."
if command -v vercel &> /dev/null; then
  vercel login
else
  npx vercel login
fi

if [ $? -ne 0 ]; then
  echo "❌ Login failed. Please try again."
  exit 1
fi

echo "✅ Logged in successfully!"
echo ""

# Step 2: Link project
echo "🔗 Step 2: Linking project to Vercel..."
echo ""

# Check if already linked
if [ -d ".vercel" ]; then
  echo "⚠️  Project already linked. Do you want to relink?"
  read -p "Type 'yes' to relink: " relink
  if [ "$relink" != "yes" ]; then
    echo "Skipping link step."
  else
    rm -rf .vercel
    if command -v vercel &> /dev/null; then
      vercel link
    else
      npx vercel link
    fi
  fi
else
  if command -v vercel &> /dev/null; then
    vercel link
  else
    npx vercel link
  fi
fi

if [ $? -ne 0 ]; then
  echo "❌ Linking failed. Please try again."
  exit 1
fi

echo "✅ Project linked successfully!"
echo ""

# Step 3: Deploy
echo "🚀 Step 3: Deploying to Vercel..."
echo ""
read -p "Deploy to production? (y/n): " deploy
if [ "$deploy" = "y" ] || [ "$deploy" = "Y" ]; then
  if command -v vercel &> /dev/null; then
    vercel --prod
  else
    npx vercel --prod
  fi
else
  echo "Skipping deployment. You can deploy later with: vercel --prod"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Verify webhook is created in GitHub → Settings → Webhooks"
echo "3. Test deployment by pushing a commit"

