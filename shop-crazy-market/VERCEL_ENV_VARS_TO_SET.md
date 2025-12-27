# Vercel Environment Variables - Copy These

## ⚠️ URGENT: Set These in Vercel Now

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. DATABASE_URL (REQUIRED - Copy This Exactly)

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Settings:**
- Name: `DATABASE_URL`
- Value: (paste the URL above)
- Environments: ✅ Production, ✅ Preview, ✅ Development

### 2. NEXT_PUBLIC_SITE_URL

```
https://shopcrazymarket.com
```

**Settings:**
- Name: `NEXT_PUBLIC_SITE_URL`
- Value: `https://shopcrazymarket.com`
- Environments: ✅ Production, ✅ Preview, ✅ Development

### 3. Stripe Keys (If you have them)

- `STRIPE_SECRET_KEY` = (your Stripe secret key)
- `STRIPE_WEBHOOK_SECRET` = (your Stripe webhook secret)
- `STRIPE_LISTING_FEE_PRICE_ID` = (your Stripe price ID)

### 4. Supabase Keys (If you have them)

- `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
- `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)

## Quick Steps

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project
3. **Click**: Settings → Environment Variables
4. **Click**: "Add New"
5. **Paste** the DATABASE_URL above
6. **Select**: All environments (Production, Preview, Development)
7. **Click**: Save
8. **Redeploy** your project

## After Setting

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. The build should succeed now

## Verify It's Set

After redeploying, check the build logs - you should NOT see "DATABASE_URL is not set" error anymore.

