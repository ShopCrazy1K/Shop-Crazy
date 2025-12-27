# Stripe Webhook Setup Guide

## Problem
If webhooks aren't showing events in Stripe Dashboard, the webhook endpoint is likely not configured or not receiving events.

## Solution: Configure Webhook in Stripe Dashboard

### Step 1: Choose Your Webhook Endpoint

You have two webhook handlers in your codebase:
- `/api/webhooks/stripe` (Primary - recommended)
- `/api/stripe/webhook` (Secondary)

**Use only ONE endpoint** to avoid conflicts.

### Step 2: Get Your Production URL

Your production webhook URL should be:
```
https://shopcrazymarket.com/api/webhooks/stripe
```

Or if using the secondary endpoint:
```
https://shopcrazymarket.com/api/stripe/webhook
```

### Step 3: Configure in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"** or **"Create webhook"**
3. Enter your webhook URL:
   ```
   https://shopcrazymarket.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed` (Required for order payments)
   - ✅ `customer.subscription.created` (For listing fee subscriptions)
   - ✅ `customer.subscription.updated` (For subscription status changes)
   - ✅ `customer.subscription.deleted` (For subscription cancellations)
5. Click **"Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_...`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 4: Set Environment Variable in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** The webhook secret from Step 3 (starts with `whsec_...`)
   - **Environment:** Production, Preview, Development (select all)
3. Click **"Save"**
4. **Redeploy** your application for the change to take effect

### Step 5: Test the Webhook

1. Make a test purchase on your site
2. Go to Stripe Dashboard → Webhooks → Your endpoint
3. Click on the endpoint to view events
4. You should see `checkout.session.completed` events appearing

### Step 6: Verify Webhook is Working

Check your Vercel function logs:
1. Go to Vercel Dashboard → Your Project → Functions
2. Look for `/api/webhooks/stripe` function calls
3. Check logs for webhook processing messages

## Troubleshooting

### No Events Showing
- ✅ Verify webhook URL is correct and accessible
- ✅ Check that `STRIPE_WEBHOOK_SECRET` is set in Vercel
- ✅ Ensure webhook endpoint is enabled (not disabled)
- ✅ Check Vercel function logs for errors

### Webhook Signature Verification Failed
- ✅ Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- ✅ Make sure you're using the correct webhook secret for your environment (test vs live)

### Events Not Processing
- ✅ Check Vercel function logs for errors
- ✅ Verify the webhook handler code is correct
- ✅ Test with Stripe's webhook testing tool in the dashboard

## Quick Test

After setup, you can test by:
1. Creating a test listing
2. Purchasing it with test card: `4242 4242 4242 4242`
3. Check Stripe Dashboard → Webhooks → Events
4. You should see `checkout.session.completed` event
5. Check your order - it should update to "paid" status

## Important Notes

- **Only configure ONE webhook endpoint** (choose either `/api/webhooks/stripe` or `/api/stripe/webhook`)
- The webhook secret is different for test mode and live mode
- Make sure to use the correct secret for your environment
- Webhooks can take a few seconds to process, which is why we added the payment status check button

