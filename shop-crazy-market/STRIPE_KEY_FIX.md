# 🔧 Fix: Stripe API Key Missing Error

## Error Message
```
You did not provide an API key. You need to provide your API key in the Authorization header, using Bearer auth
```

## ✅ Fix Required

You need to add `STRIPE_SECRET_KEY` to your Vercel environment variables.

## 🚀 Steps to Fix

### Step 1: Get Your Stripe Secret Key

1. Go to Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. Find your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
3. Click **"Reveal"** to show the full key
4. Copy the entire key

### Step 2: Add to Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (starts with `sk_...`)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Redeploy

After adding the variable:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger redeploy

## 🔍 Verify

After redeploying, the Stripe error should be resolved. The app will now be able to:
- Create checkout sessions
- Process payments
- Handle webhooks
- Create listing fee subscriptions

## 📝 Required Stripe Keys

For full Stripe functionality, you may also want to add:

- `STRIPE_PUBLISHABLE_KEY` - For client-side Stripe.js (starts with `pk_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above (for frontend)
- `STRIPE_WEBHOOK_SECRET` - For webhook verification (starts with `whsec_...`)

## 🆘 Still Not Working?

1. **Check Vercel Logs:**
   - Go to Deployments → Latest → Functions
   - Look for Stripe-related errors

2. **Verify Key Format:**
   - Secret key should start with `sk_test_` or `sk_live_`
   - No extra spaces or quotes
   - Full key copied (very long string)

3. **Check Key Mode:**
   - Test keys start with `sk_test_`
   - Live keys start with `sk_live_`
   - Make sure you're using the right mode for your environment

## 📚 Resources

- Stripe Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Stripe Docs: https://stripe.com/docs

