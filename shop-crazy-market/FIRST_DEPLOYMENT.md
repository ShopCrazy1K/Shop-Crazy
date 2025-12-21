# 🚀 First Deployment Setup

If you see "nothing in deployment section", the repository hasn't been connected to Vercel yet.

## Step 1: Connect GitHub Repository

### Option A: If Repository is Already on GitHub

1. **Go to Vercel Project Settings:**
   - https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect Repository:**
   - Click **"Connect Git Repository"** button
   - Search for: `ShopCrazy1K/Shop-Crazy`
   - Select it
   - Grant permissions if prompted
   - Click **"Connect"**

3. **Set Root Directory:**
   - Go to: Settings → General
   - Find **"Root Directory"** field
   - Enter: `shop-crazy-market`
   - Click **"Save"**

4. **Deploy:**
   - Vercel should automatically start deploying
   - OR go to Deployments tab and click **"Deploy"**

### Option B: If Repository Needs to be Pushed First

If `ShopCrazy1K/Shop-Crazy` is empty or doesn't exist:

1. **Push Your Code:**
   ```bash
   cd /Users/ronhart/social-app/shop-crazy-market
   git add .
   git commit -m "Initial deployment: Shop Crazy Market"
   git push -u origin main
   ```

2. **Then follow Option A above**

## Step 2: Verify Settings

After connecting, verify these settings:

### General Settings
- **Root Directory:** `shop-crazy-market` ✅
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Environment Variables
- All variables should be set (see VERCEL_ENV_SETUP.md)
- Make sure they're set for **Production** environment

## Step 3: First Deployment

Once connected:

1. **Automatic Deployment:**
   - Vercel will automatically detect the push
   - Starts building immediately
   - Takes 2-5 minutes

2. **Manual Deployment:**
   - Go to: Deployments tab
   - Click **"Deploy"** button
   - Select branch: `main`
   - Click **"Deploy"**

3. **Watch Build:**
   - Build logs appear in real-time
   - Check for any errors
   - Wait for "Ready" status

## Step 4: After First Deployment

### Get Your Domain

After successful deployment:
- Vercel assigns a domain: `https://social-app-[hash].vercel.app`
- Or your custom domain if configured

### Update Environment Variables

1. **Update NEXT_PUBLIC_SITE_URL:**
   - Go to: Settings → Environment Variables
   - Find `NEXT_PUBLIC_SITE_URL`
   - Update to: `https://your-actual-domain.vercel.app`
   - Redeploy

2. **Update Stripe Webhook:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Update webhook URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Verify secret matches

## Troubleshooting

### "Repository not found"
- Make sure you have access to `ShopCrazy1K/Shop-Crazy`
- Check if repository exists on GitHub
- Verify GitHub account is connected to Vercel

### "No deployments"
- Repository might not be connected
- Check Settings → Git → Repository
- Try disconnecting and reconnecting

### "Build fails"
- Check build logs for specific errors
- Verify all environment variables are set
- Check Root Directory is correct: `shop-crazy-market`

### "Can't find package.json"
- Root Directory might be wrong
- Should be: `shop-crazy-market`
- Not: `.` or empty

## Quick Checklist

- [ ] Repository `ShopCrazy1K/Shop-Crazy` exists on GitHub
- [ ] Code is pushed to GitHub (if needed)
- [ ] Repository connected in Vercel Settings → Git
- [ ] Root Directory set to `shop-crazy-market`
- [ ] Environment variables added (see VERCEL_ENV_SETUP.md)
- [ ] First deployment triggered
- [ ] Build completes successfully
- [ ] Application is accessible at Vercel URL

## Next Steps After Deployment

1. ✅ Test the application
2. ✅ Update `NEXT_PUBLIC_SITE_URL` with actual domain
3. ✅ Configure Stripe webhook
4. ✅ Test checkout flow
5. ✅ Verify database connection

---

**Need help?** Check the build logs in Vercel for specific error messages!

