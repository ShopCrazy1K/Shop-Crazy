# Alternative Ways to Create Stripe Webhook

If the Stripe Dashboard won't let you create webhooks due to browser compatibility, use one of these methods:

## Method 1: Use Stripe CLI (Recommended)

### Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe:
```bash
stripe login
```

### Create Webhook:
```bash
stripe webhook-endpoints create \
  --url https://shopcrazymarket.com/api/webhooks/stripe \
  --enabled-events checkout.session.completed \
  --enabled-events customer.subscription.created \
  --enabled-events customer.subscription.updated \
  --enabled-events customer.subscription.deleted \
  --description "Shop Crazy Market - Orders and Subscriptions"
```

### Copy the Signing Secret:
The command will output a signing secret (starts with `whsec_...`). Copy it and add to Vercel.

## Method 2: Use Node.js Script

### Run the script:
```bash
cd /Users/ronhart/social-app/shop-crazy-market
export STRIPE_SECRET_KEY="sk_live_..." # Your Stripe secret key
node scripts/create-webhook.js
```

The script will:
1. Create the webhook endpoint
2. Display the signing secret
3. Tell you exactly what to add to Vercel

## Method 3: Use cURL (Command Line)

```bash
curl https://api.stripe.com/v1/webhook_endpoints \
  -u sk_live_YOUR_SECRET_KEY: \
  -d url=https://shopcrazymarket.com/api/webhooks/stripe \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -d description="Shop Crazy Market Webhook"
```

Replace `sk_live_YOUR_SECRET_KEY` with your actual Stripe secret key.

## Method 4: Try Different Browser

If you want to use the dashboard:
1. **Use Chrome or Firefox** (not Safari)
2. **Update your browser** to the latest version
3. **Clear browser cache** and cookies for stripe.com
4. **Try incognito/private mode**

## After Creating Webhook (Any Method):

### 1. Get the Signing Secret
- From CLI: It's shown in the output
- From Script: It's printed at the end
- From cURL: Check the response JSON for `secret` field

### 2. Add to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** The `whsec_...` secret
   - **Environment:** All environments
3. Click **"Save"**
4. **Redeploy** your application

### 3. Verify It Works:
1. Make a test purchase
2. Check Vercel function logs for `/api/webhooks/stripe`
3. Orders should update to "paid" automatically

## Quick Test Command (Stripe CLI):

After setup, you can test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This forwards Stripe events to your local server for testing.

