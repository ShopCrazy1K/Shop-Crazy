# 🚀 Connect to Vercel - Final Steps

Your code is now on GitHub! Let's connect it to Vercel and deploy.

## Step 1: Connect Repository (2 minutes)

1. **Go to Vercel Git Settings:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect Repository:**
   - Click **"Connect Git Repository"** button (or "Change" if one exists)
   - Search for: `ShopCrazy1K/Shop-Crazy`
   - Select it from the list
   - Grant permissions if prompted
   - Click **"Connect"**

3. **Verify Connection:**
   - You should see: `ShopCrazy1K/Shop-Crazy` as the connected repository
   - Branch: `main`

## Step 2: Set Root Directory (Critical!)

1. **Go to General Settings:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/general

2. **Find "Root Directory":**
   - Scroll down to "Root Directory" section
   - Click **"Edit"**

3. **Enter Root Directory:**
   ```
   shop-crazy-market
   ```
   - ⚠️ **Important:** Must be exactly `shop-crazy-market` (not `.` or empty)
   - This tells Vercel where your Next.js app is located

4. **Save:**
   - Click **"Save"**

## Step 3: Verify Environment Variables

Before deploying, make sure all environment variables are set:

1. **Go to Environment Variables:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. **Verify these are set:**
   - ✅ `DATABASE_URL`
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `STRIPE_PUBLISHABLE_KEY`
   - ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - ✅ `STRIPE_WEBHOOK_SECRET` (Production only)
   - ✅ `NEXT_PUBLIC_SITE_URL` (can update after first deploy)
   - ✅ `RESEND_API_KEY` or SMTP variables
   - ✅ `EMAIL_FROM`
   - ✅ `ADMIN_EMAIL`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` (if using)
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if using)

3. **Check Environments:**
   - Make sure variables are set for **Production** environment
   - `NEXT_PUBLIC_*` variables should be in Production

## Step 4: Deploy!

### Automatic Deployment
- After connecting repository and setting root directory, Vercel should automatically start deploying
- You'll see a new deployment appear in the Deployments tab

### Manual Deployment
If auto-deploy doesn't start:

1. **Go to Deployments:**
   https://vercel.com/shop-crazy-markets-projects/social-app/deployments

2. **Click "Deploy" button:**
   - Select branch: `main`
   - Click **"Deploy"**

3. **Watch Build:**
   - Build logs appear in real-time
   - Takes 2-5 minutes
   - Watch for any errors

## Step 5: After Deployment

### Get Your Domain

After successful deployment:
- Vercel assigns: `https://social-app-[hash].vercel.app`
- Or your custom domain if configured
- **Copy this URL!**

### Update Environment Variables

1. **Update NEXT_PUBLIC_SITE_URL:**
   - Go to: Settings → Environment Variables
   - Find `NEXT_PUBLIC_SITE_URL`
   - Update to: `https://your-actual-domain.vercel.app`
   - Redeploy

2. **Update Stripe Webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Update webhook URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Verify secret matches `STRIPE_WEBHOOK_SECRET`

## Step 6: Test Your Application

1. **Visit your Vercel URL**
2. **Test:**
   - ✅ Home page loads
   - ✅ Sign up / Login works
   - ✅ Can create listings
   - ✅ Checkout works (test card: `4242 4242 4242 4242`)
   - ✅ Database saves data

## Troubleshooting

### "Build fails - Can't find package.json"
- **Fix:** Root Directory must be `shop-crazy-market`
- Check: Settings → General → Root Directory

### "Build fails - Missing environment variable"
- **Fix:** Add missing variable in Settings → Environment Variables
- Make sure it's set for Production environment

### "Build fails - Database connection error"
- **Fix:** Verify `DATABASE_URL` is correct
- Check Supabase database is not paused

### "No deployments showing"
- **Fix:** Make sure repository is connected
- Check: Settings → Git → Repository

## Success Checklist

- [ ] Repository connected: `ShopCrazy1K/Shop-Crazy`
- [ ] Root Directory set: `shop-crazy-market`
- [ ] All environment variables added
- [ ] First deployment triggered
- [ ] Build completes successfully
- [ ] Application accessible at Vercel URL
- [ ] `NEXT_PUBLIC_SITE_URL` updated
- [ ] Stripe webhook configured

---

**🎉 Once all steps are complete, your app will be live!**

