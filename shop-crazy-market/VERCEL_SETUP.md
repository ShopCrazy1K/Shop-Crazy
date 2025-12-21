# Vercel Deployment Setup

## Current Situation
- Your Vercel project "social-app" exists but has no production deployment
- Your Next.js app is in the `shop-crazy-market` subdirectory
- Vercel needs to be configured to use this subdirectory as the root

## Solution: Configure Root Directory in Vercel

### Step 1: Update Project Settings

1. Go to your Vercel project: https://vercel.com/shop-crazy-markets-projects/social-app
2. Click **Settings** (in the top navigation)
3. Click **General** (in the left sidebar)
4. Scroll down to **Root Directory**
5. Click **Edit**
6. Enter: `shop-crazy-market`
7. Click **Save**

### Step 2: Trigger Deployment

After setting the root directory, you need to trigger a deployment:

**Option A: Push to main branch**
```bash
cd /Users/ronhart/social-app/shop-crazy-market
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

**Option B: Manual Deploy**
1. Go to Vercel Dashboard → Deployments
2. Click **"Redeploy"** on any existing deployment
3. Or click **"Deploy"** button

### Step 3: Add Environment Variables

After first deployment succeeds:

1. Go to **Settings** → **Environment Variables**
2. Add these variables (see PRODUCTION_ENV.md for values):

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhooks
- `NEXT_PUBLIC_SITE_URL` - Your Vercel URL (after first deploy)
- `NODE_ENV` - Set to `production`

**Email:**
- `RESEND_API_KEY` (or SMTP variables)
- `EMAIL_FROM`
- `ADMIN_EMAIL`

3. Select **"Production"** environment
4. Click **"Save"**
5. **Redeploy** the latest deployment

### Step 4: Configure Stripe Webhook

1. Get your Vercel URL (e.g., `https://social-app.vercel.app`)
2. Go to Stripe Dashboard → Webhooks
3. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Copy signing secret
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## Quick Checklist

- [ ] Root Directory set to `shop-crazy-market` in Vercel Settings
- [ ] Pushed latest code to main branch (or manually redeployed)
- [ ] Build succeeds
- [ ] Environment variables added
- [ ] Stripe webhook configured
- [ ] Site loads at production URL

## Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Verify Root Directory is set correctly
- Ensure all dependencies are in package.json

**Wrong framework detected?**
- Root Directory must be set to `shop-crazy-market`
- Vercel should auto-detect Next.js

**Environment variables not working?**
- Make sure you selected "Production" environment
- Redeploy after adding variables

