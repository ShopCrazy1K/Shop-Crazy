#!/bin/bash

# Simple Deployment Trigger - Minimal change approach
# This just commits and pushes the current state

set -e

echo "🚀 Triggering Vercel Deployment (Simple Method)..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# Get timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

echo "📝 Creating deployment marker..."
MARKER="shop-crazy-market/.last-deployment"
echo "$TIMESTAMP - $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" > "$MARKER"

echo "💾 Committing deployment trigger..."
git add "$MARKER" || true

# Commit with deployment message
git commit -m "Trigger deployment: $TIMESTAMP [skip ci]" --allow-empty 2>/dev/null || \
git commit -m "Trigger deployment: $TIMESTAMP" 2>/dev/null || {
    echo "⚠️  Nothing to commit, pushing anyway..."
}

echo "📤 Pushing to origin/$BRANCH..."
git push origin "$BRANCH" && {
    echo ""
    echo "✅ Success! Deployment triggered"
    echo "⏳ Check Vercel dashboard in 30 seconds"
    echo "   https://vercel.com/dashboard"
} || {
    echo "❌ Push failed"
    exit 1
}
