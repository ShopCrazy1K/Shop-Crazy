# Quick Stripe Webhook Setup

## ⚠️ Important: Use "Webhooks" NOT "Event Destinations"

You're currently on the "Event destinations" page. For webhooks, you need to use the **"Webhooks"** section instead.

## Correct Steps:

### Step 1: Go to Webhooks Section
1. In Stripe Dashboard, click **"Developers"** in the left sidebar
2. Click **"Webhooks"** (NOT "Event destinations")
3. You should see a page with existing webhooks or an "Add endpoint" button

### Step 2: Add Webhook Endpoint
1. Click **"Add endpoint"** button
2. Enter your webhook URL:
   ```
   https://shopcrazymarket.com/api/webhooks/stripe
   ```
3. Click **"Select events"** or **"Add events"**
4. You'll see a list of events - select these:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **"Add endpoint"**

### Step 3: Copy Webhook Secret
1. After creating the endpoint, you'll see a page with webhook details
2. Find the **"Signing secret"** section
3. Click **"Reveal"** or **"Click to reveal"**
4. Copy the secret (starts with `whsec_...`)

### Step 4: Add to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** The `whsec_...` secret
   - **Environment:** All environments
3. Click **"Save"**
4. **Redeploy** your application

## Alternative: Direct Link

Try this direct link to the Webhooks page:
```
https://dashboard.stripe.com/webhooks
```

## If You Still Don't See Events

1. Make sure you're in the correct Stripe account
2. Try refreshing the page
3. Check if you have the right permissions (you need admin access)
4. Try using the search box to find specific events like "checkout.session.completed"

## Quick Test

After setup:
1. Make a test purchase
2. Go back to Webhooks → Your endpoint
3. Click on the endpoint to see events
4. You should see `checkout.session.completed` events

