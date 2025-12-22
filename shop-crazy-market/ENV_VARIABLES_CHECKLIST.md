# Environment Variables Checklist

## ✅ Already Added
- [x] `DATABASE_URL` - Database connection

## 🔴 Critical - Add These Next

These are required for the app to function:

### 1. STRIPE_SECRET_KEY
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- **Get from:** https://dashboard.stripe.com/apikeys
- **Environments:** Production, Preview, Development

### 2. STRIPE_PUBLISHABLE_KEY
- **Key:** `STRIPE_PUBLISHABLE_KEY`
- **Value:** Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)
- **Get from:** https://dashboard.stripe.com/apikeys
- **Environments:** Production, Preview, Development

### 3. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** Same as `STRIPE_PUBLISHABLE_KEY` above
- **Environments:** Production, Preview, Development

### 4. NEXT_PUBLIC_SITE_URL
- **Key:** `NEXT_PUBLIC_SITE_URL`
- **Value:** Your Vercel URL (update after first deploy)
  - Format: `https://your-project.vercel.app`
  - Example: `https://social-app-abc123.vercel.app`
- **Note:** You can set a placeholder now, update after deployment
- **Environments:** Production, Preview

## 🟡 Important - For Full Functionality

### 5. STRIPE_WEBHOOK_SECRET
- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** Your Stripe webhook secret (starts with `whsec_`)
- **Get from:** https://dashboard.stripe.com/webhooks
- **Environments:** Production only
- **Note:** Set up webhook after deployment

### 6. RESEND_API_KEY (or SMTP)
- **Key:** `RESEND_API_KEY`
- **Value:** Your Resend API key (starts with `re_`)
- **Get from:** https://resend.com/api-keys
- **Environments:** Production, Preview
- **OR use SMTP instead** (see below)

### 7. EMAIL_FROM
- **Key:** `EMAIL_FROM`
- **Value:** `Shop Crazy Market <noreply@yourdomain.com>`
- **Environments:** Production, Preview

### 8. ADMIN_EMAIL
- **Key:** `ADMIN_EMAIL`
- **Value:** `admin@yourdomain.com` (your email)
- **Environments:** Production, Preview

## 🟢 Optional - If Using Supabase Features

### 9. NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://hbufjpxdzmygjnbfsniu.supabase.co`
- **Environments:** Production, Preview, Development

### 10. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key
- **Get from:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
- **Environments:** Production, Preview, Development

## Quick Add Guide

### Minimum to Deploy (Can add others later):
1. ✅ DATABASE_URL (done!)
2. STRIPE_SECRET_KEY
3. STRIPE_PUBLISHABLE_KEY
4. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
5. NEXT_PUBLIC_SITE_URL (placeholder: `https://your-domain.vercel.app`)

### For Full Features:
Add all the variables above.

## After First Deployment

1. **Get your Vercel URL:**
   - Go to Deployments
   - Copy the URL (e.g., `https://social-app-abc123.vercel.app`)

2. **Update NEXT_PUBLIC_SITE_URL:**
   - Settings → Environment Variables
   - Edit `NEXT_PUBLIC_SITE_URL`
   - Update with your actual Vercel URL
   - Redeploy

3. **Set up Stripe Webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Copy webhook secret
   - Add `STRIPE_WEBHOOK_SECRET` in Vercel

---

**For now, add at least the Stripe keys to get the app working!**

