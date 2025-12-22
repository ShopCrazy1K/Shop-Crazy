# Stripe Keys Setup for Vercel

You've provided your Stripe **Publishable Key** (starts with `pk_live_`). Here's how to add all required Stripe keys to Vercel:

## Required Stripe Environment Variables

### 1. STRIPE_PUBLISHABLE_KEY (Client-Side) ✅ You have this!

**Key Name:** `STRIPE_PUBLISHABLE_KEY`  
**Value:** `pk_live_51Sgqx8Cmvd4jlAX7henTmsW7e3vrio95lCNRQgF5Y9MeSLHHNMVZKv706HvSAKb9tJYSMxdvF5yQMVESDLjB5DuP00plSYaWK6`

**Where to add in Vercel:**
1. Go to your project → Settings → Environment Variables
2. Click "Add New"
3. **Key:** `STRIPE_PUBLISHABLE_KEY`
4. **Value:** `pk_live_51Sgqx8Cmvd4jlAX7henTmsW7e3vrio95lCNRQgF5Y9MeSLHHNMVZKv706HvSAKb9tJYSMxdvF5yQMVESDLjB5DuP00plSYaWK6`
5. **Environment:** Production, Preview, Development (select all)
6. Click "Save"

---

### 2. STRIPE_SECRET_KEY (Server-Side) ⚠️ You need this!

**Key Name:** `STRIPE_SECRET_KEY`  
**Value:** Your Stripe Secret Key (starts with `sk_live_`)

**How to get it:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Under "Secret key" → Click "Reveal test key" or "Reveal live key"
3. Copy the key (starts with `sk_live_` for production)

**Where to add in Vercel:**
1. Go to your project → Settings → Environment Variables
2. Click "Add New"
3. **Key:** `STRIPE_SECRET_KEY`
4. **Value:** `sk_live_...` (your secret key)
5. **Environment:** Production only (⚠️ Never expose this in client-side code!)
6. Click "Save"

---

### 3. STRIPE_WEBHOOK_SECRET (For Webhooks) ⚠️ You need this!

**Key Name:** `STRIPE_WEBHOOK_SECRET`  
**Value:** Your Stripe Webhook Signing Secret (starts with `whsec_`)

**How to get it:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint (or create one)
3. Under "Signing secret" → Click "Reveal"
4. Copy the secret (starts with `whsec_`)

**Where to add in Vercel:**
1. Go to your project → Settings → Environment Variables
2. Click "Add New"
3. **Key:** `STRIPE_WEBHOOK_SECRET`
4. **Value:** `whsec_...` (your webhook secret)
5. **Environment:** Production only
6. Click "Save"

---

## Quick Checklist

- [ ] ✅ `STRIPE_PUBLISHABLE_KEY` - You have this: `pk_live_51Sgqx8Cmvd4jlAX7henTmsW7e3vrio95lCNRQgF5Y9MeSLHHNMVZKv706HvSAKb9tJYSMxdvF5yQMVESDLjB5DuP00plSYaWK6`
- [ ] ⚠️ `STRIPE_SECRET_KEY` - Get from Stripe Dashboard → API Keys
- [ ] ⚠️ `STRIPE_WEBHOOK_SECRET` - Get from Stripe Dashboard → Webhooks

---

## Security Notes

1. **Publishable Key (`pk_live_`):**
   - ✅ Safe to expose in client-side code
   - ✅ Can be in public repositories
   - ✅ Used in frontend for Stripe.js

2. **Secret Key (`sk_live_`):**
   - ⚠️ **NEVER** expose in client-side code
   - ⚠️ **NEVER** commit to Git
   - ⚠️ Only use in server-side API routes
   - ⚠️ Only add to Production environment in Vercel

3. **Webhook Secret (`whsec_`):**
   - ⚠️ **NEVER** expose in client-side code
   - ⚠️ Used to verify webhook requests are from Stripe
   - ⚠️ Only add to Production environment in Vercel

---

## After Adding Keys

1. **Redeploy your application** in Vercel (or wait for auto-deploy)
2. **Test the checkout flow** to ensure Stripe integration works
3. **Set up webhook endpoint** in Stripe Dashboard:
   - URL: `https://your-vercel-app.vercel.app/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `charge.refunded`
     - `charge.dispute.created`
     - `payment_intent.succeeded`

---

## Need Help?

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe API Keys: https://dashboard.stripe.com/apikeys
- Stripe Webhooks: https://dashboard.stripe.com/webhooks
- Stripe Docs: https://stripe.com/docs

