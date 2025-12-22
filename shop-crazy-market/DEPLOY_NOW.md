# 🚀 Deploy Now - Final Steps

Your code is on GitHub! Follow these steps to deploy to Vercel.

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub: `ShopCrazy1K/Shop-Crazy`
- [x] All files in `shop-crazy-market` folder
- [ ] Repository connected in Vercel
- [ ] Root Directory set to `shop-crazy-market`
- [ ] Environment variables configured

## Step 1: Connect Repository (2 minutes)

1. **Go to Vercel Git Settings:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect Repository:**
   - If you see "Connect Git Repository" button, click it
   - Search for: `ShopCrazy1K/Shop-Crazy`
   - Select it from the list
   - Grant permissions if prompted
   - Click **"Connect"**

3. **Verify Connection:**
   - You should see: `ShopCrazy1K/Shop-Crazy` as connected
   - Branch: `main`

## Step 2: Set Root Directory (CRITICAL!)

**This is the most important step!**

1. **Go to General Settings:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/general

2. **Find "Root Directory":**
   - Scroll down to "Root Directory" section
   - Click **"Edit"**

3. **Enter Root Directory:**
   ```
   shop-crazy-market
   ```
   - ⚠️ **Must be exactly:** `shop-crazy-market` (not `.` or empty)
   - This tells Vercel where your Next.js app is located

4. **Save:**
   - Click **"Save"**

## Step 3: Verify Environment Variables

Before deploying, make sure these are set:

1. **Go to Environment Variables:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. **Required Variables:**
   - ✅ `DATABASE_URL`
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `STRIPE_PUBLISHABLE_KEY`
   - ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - ✅ `STRIPE_WEBHOOK_SECRET` (Production)
   - ✅ `NEXT_PUBLIC_SITE_URL` (can update after deploy)
   - ✅ `RESEND_API_KEY` or SMTP variables
   - ✅ `EMAIL_FROM`
   - ✅ `ADMIN_EMAIL`

3. **Check Environments:**
   - Variables should be set for **Production** environment
   - `NEXT_PUBLIC_*` variables must be in Production

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

## Step 5: Monitor Build

### What to Watch For:

1. **Build Logs:**
   - Should see: "Installing dependencies"
   - Then: "Running build command"
   - Then: "Generating static pages"
   - Finally: "Build completed"

2. **Common Issues:**
   - ❌ "Can't find package.json" → Root Directory wrong
   - ❌ "Missing environment variable" → Add missing variable
   - ❌ "Database connection failed" → Check DATABASE_URL
   - ❌ "Build failed" → Check logs for specific error

## Step 6: After Successful Deployment

### Get Your Domain

After build completes:
- Vercel assigns: `https://social-app-[hash].vercel.app`
- Or your custom domain if configured
- **Copy this URL!**

### Update Environment Variables

1. **Update NEXT_PUBLIC_SITE_URL:**
   - Go to: Settings → Environment Variables
   - Find `NEXT_PUBLIC_SITE_URL`
   - Update to: `https://your-actual-domain.vercel.app`
   - Click **"Save"**
   - **Redeploy** (or wait for next auto-deploy)

2. **Update Stripe Webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Update webhook URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Verify secret matches `STRIPE_WEBHOOK_SECRET` in Vercel

## Step 7: Test Your Application

1. **Visit your Vercel URL**
2. **Test:**
   - ✅ Home page loads
   - ✅ Sign up / Login works
   - ✅ Can create listings
   - ✅ Checkout works (test card: `4242 4242 4242 4242`)
   - ✅ Database saves data

## Troubleshooting

### "Repository is empty"
- **Fix:** Make sure Root Directory is `shop-crazy-market`
- Verify repository is connected correctly

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
- Try clicking "Deploy" manually

## Success Indicators

You'll know deployment is successful when:

- ✅ Build status shows "Ready"
- ✅ You get a Vercel URL
- ✅ Application loads in browser
- ✅ No errors in build logs
- ✅ Environment variables are loaded

---

## Quick Links

- **Vercel Dashboard:** https://vercel.com/shop-crazy-markets-projects/social-app
- **Git Settings:** https://vercel.com/shop-crazy-markets-projects/social-app/settings/git
- **General Settings:** https://vercel.com/shop-crazy-markets-projects/social-app/settings/general
- **Environment Variables:** https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables
- **Deployments:** https://vercel.com/shop-crazy-markets-projects/social-app/deployments

---

**🎉 Once deployment completes, your app will be live!**
