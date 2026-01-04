#!/bin/bash

# Trigger Vercel Deployment Script
# This script makes a small change and pushes to trigger auto-deploy

set -e

echo "🚀 Triggering Vercel Deployment..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT=$(pwd)
SHOP_DIR="$PROJECT_ROOT/shop-crazy-market"

echo "📂 Project root: $PROJECT_ROOT"
echo "📁 Shop directory: $SHOP_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "$SHOP_DIR/package.json" ]; then
    echo "❌ Error: shop-crazy-market/package.json not found"
    exit 1
fi

# Get current git status
echo "📊 Checking git status..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Files changed:"
    git status --short
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Create a deployment trigger file with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DEPLOY_TRIGGER_FILE="$SHOP_DIR/.deploy-trigger"

echo "📝 Creating deployment trigger..."
echo "Deployment triggered: $TIMESTAMP
Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')" > "$DEPLOY_TRIGGER_FILE"

# Add a comment to next.config.js to trigger rebuild
if [ -f "$SHOP_DIR/next.config.js" ]; then
    echo ""
    echo "📝 Updating next.config.js with deployment trigger..."
    
    # Remove old trigger comments (lines starting with // DEPLOY_TRIGGER)
    sed -i.bak '/^\/\/ DEPLOY_TRIGGER/d' "$SHOP_DIR/next.config.js" 2>/dev/null || true
    rm -f "$SHOP_DIR/next.config.js.bak" 2>/dev/null || true
    
    # Add new trigger comment at the top after any existing comments
    cat > "$SHOP_DIR/next.config.js.tmp" << 'EOF'
// DEPLOY_TRIGGER
EOF
    echo "// Deployment triggered: $TIMESTAMP" >> "$SHOP_DIR/next.config.js.tmp"
    echo "" >> "$SHOP_DIR/next.config.js.tmp"
    cat "$SHOP_DIR/next.config.js" >> "$SHOP_DIR/next.config.js.tmp"
    mv "$SHOP_DIR/next.config.js.tmp" "$SHOP_DIR/next.config.js"
fi

echo "✅ Deployment trigger files created"
echo ""

# Stage changes
echo "📦 Staging changes..."
git add "$SHOP_DIR/next.config.js" "$DEPLOY_TRIGGER_FILE" 2>/dev/null || true

# Check if there are any changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit. Files may already be up to date."
    echo "   Forcing a commit anyway..."
    # Make a small whitespace change if no changes
    echo "" >> "$SHOP_DIR/.deploy-trigger"
    git add "$SHOP_DIR/.deploy-trigGER" 2>/dev/null || true
fi

# Commit
COMMIT_MSG="Trigger deployment: $TIMESTAMP

This commit triggers a new Vercel deployment.
Latest changes include notification bell fixes."

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG" || {
    echo "❌ Error: Failed to commit. You may need to commit manually."
    exit 1
}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

echo ""
echo "🌿 Current branch: $CURRENT_BRANCH"
echo ""

# Push to remote
echo "📤 Pushing to origin/$CURRENT_BRANCH..."
if git push origin "$CURRENT_BRANCH"; then
    echo ""
    echo "✅ Success! Deployment trigger pushed to GitHub"
    echo ""
    echo "⏳ Vercel should start deploying in 10-30 seconds..."
    echo ""
    echo "📊 Monitor deployment:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "🔍 Check status with:"
    echo "   git log --oneline -1"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to push to GitHub"
    echo "   Please check your git remote and authentication"
    exit 1
fi
