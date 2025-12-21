# Vercel Deployment Steps

## You're on the Vercel "New Project" Page

Follow these steps:

### Step 1: Import Repository
1. Click **"Import Git Repository"**
2. Select your repository: `shart1000n-ship-it/social-app`
3. If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

### Step 2: Configure Project
1. **Project Name**: `shop-crazy-market` (or your preferred name)
2. **Root Directory**: If your Next.js app is in a subdirectory, set it to `shop-crazy-market`
   - Click "Edit" next to Root Directory
   - Enter: `shop-crazy-market`
3. **Framework Preset**: Should auto-detect "Next.js"
4. **Build Command**: `npm run build` (should be auto-filled)
5. **Output Directory**: `.next` (should be auto-filled)
6. **Install Command**: `npm install` (should be auto-filled)

### Step 3: Environment Variables (Add After First Deploy)
You can skip this for now and add after first deployment.

**Required Variables:**
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NODE_ENV=production
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. You'll get a URL like: `https://shop-crazy-market.vercel.app`

### Step 5: Add Environment Variables
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable from Step 3
4. Select **"Production"** environment
5. Click **"Save"**
6. Go to **Deployments** → Click **"Redeploy"** on latest deployment

### Step 6: Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy signing secret
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## Important Notes

- **Root Directory**: If your Next.js app is inside `shop-crazy-market` folder, make sure to set it!
- **Environment Variables**: Add them after first deployment so you know your Vercel URL
- **Database**: Make sure your PostgreSQL database is accessible from Vercel's servers
- **Custom Domain**: You can add a custom domain later in Settings → Domains

## Troubleshooting

If build fails:
- Check build logs in Vercel dashboard
- Ensure Root Directory is set correctly
- Verify all dependencies are in `package.json`
- Check that `DATABASE_URL` is set (even if using placeholder for first build)

