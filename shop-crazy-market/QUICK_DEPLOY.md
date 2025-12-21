# Quick Deployment Guide

## ✅ Build Status: PASSING

Your application builds successfully! Ready to deploy.

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd /Users/ronhart/social-app/shop-crazy-market
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)
- Override settings? **No**

### Step 4: Set Environment Variables

After first deployment, go to:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables (see PRODUCTION_ENV.md for values):

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_live_...)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (pk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as above
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings
- `NEXT_PUBLIC_SITE_URL` - Your Vercel URL (e.g., https://shop-crazy-market.vercel.app)
- `NODE_ENV` - Set to `production`

**Email (choose one):**
- `RESEND_API_KEY` - OR use SMTP variables
- `EMAIL_FROM` - Your email address
- `ADMIN_EMAIL` - Admin email

3. Select **"Production"** environment
4. Click **"Save"**
5. Go to **Deployments** → Click **"Redeploy"** on latest deployment

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel

### Step 6: Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables (same as Step 4 above)
6. Deploy!

## Option 3: Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`
4. Set environment variables in Netlify Dashboard

## Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] Database connection works
- [ ] Stripe checkout works
- [ ] Webhooks are receiving events (check Stripe Dashboard)
- [ ] Email notifications work
- [ ] All pages load correctly

## Your Deployment URL

After deployment, your site will be at:
- Vercel: `https://your-project-name.vercel.app`
- Or your custom domain if configured

Update `NEXT_PUBLIC_SITE_URL` with this URL!

