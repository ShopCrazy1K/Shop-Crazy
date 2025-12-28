#!/bin/bash

# Script to create Stripe webhook endpoint
# Usage: ./scripts/setup-webhook.sh YOUR_STRIPE_SECRET_KEY

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Stripe secret key required"
  echo ""
  echo "Usage: ./scripts/setup-webhook.sh sk_live_YOUR_KEY"
  echo ""
  echo "Or set STRIPE_SECRET_KEY environment variable:"
  echo "  export STRIPE_SECRET_KEY='sk_live_YOUR_KEY'"
  echo "  ./scripts/setup-webhook.sh"
  exit 1
fi

STRIPE_KEY="${1:-$STRIPE_SECRET_KEY}"
WEBHOOK_URL="https://shopcrazymarket.com/api/webhooks/stripe"

echo "🔧 Creating Stripe webhook endpoint..."
echo "URL: $WEBHOOK_URL"
echo ""

# Create webhook using cURL
RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_KEY:" \
  -d "url=$WEBHOOK_URL" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -d "description=Shop Crazy Market - Orders and Subscriptions")

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
  echo "❌ Error creating webhook:"
  echo "$RESPONSE" | grep -o '"message":"[^"]*"' | head -1
  exit 1
fi

# Extract webhook details
WEBHOOK_ID=$(echo "$RESPONSE" | grep -o '"id":"we_[^"]*"' | cut -d'"' -f4)
SECRET=$(echo "$RESPONSE" | grep -o '"secret":"whsec_[^"]*"' | cut -d'"' -f4)

if [ -z "$SECRET" ]; then
  echo "⚠️  Webhook created but secret not found in response."
  echo "You'll need to get the secret from Stripe Dashboard:"
  echo "https://dashboard.stripe.com/webhooks"
  echo ""
  echo "Webhook ID: $WEBHOOK_ID"
else
  echo "✅ Webhook created successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 WEBHOOK DETAILS:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "ID: $WEBHOOK_ID"
  echo "URL: $WEBHOOK_URL"
  echo ""
  echo "🔑 SIGNING SECRET (Add this to Vercel):"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$SECRET"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📝 NEXT STEPS:"
  echo "1. Copy the signing secret above (starts with whsec_)"
  echo "2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
  echo "3. Add/Update:"
  echo "   Name: STRIPE_WEBHOOK_SECRET"
  echo "   Value: $SECRET"
  echo "   Environment: All environments"
  echo "4. Save and redeploy your application"
  echo ""
fi

