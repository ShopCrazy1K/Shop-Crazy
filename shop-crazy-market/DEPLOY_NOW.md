# 🚀 Manual Deployment Instructions

## Problem: Updates Not Being Applied

If your changes are pushed to GitHub but not showing up in Vercel:

### Option 1: Manual Redeploy in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Find your `shop-crazy-market` project

2. **Navigate to Deployments:**
   - Click on your project
   - Go to the **"Deployments"** tab

3. **Trigger New Deployment:**
   - Find the latest deployment (or any deployment)
   - Click the **"..."** (three dots) menu
   - Select **"Redeploy"**
   - Click **"Redeploy"** in the confirmation dialog

4. **Monitor Deployment:**
   - Watch the build logs
   - Wait for deployment to complete
   - Your changes should be live!

---

### Option 2: Verify Project Configuration

**Check Root Directory Setting:**
1. Go to Vercel → Your Project → Settings → General
2. Under **"Root Directory"**, verify it's set to:
   - `shop-crazy-market` (if the project is configured for subdirectory)
   - OR leave empty if deploying from repository root

**Check Auto-Deploy:**
1. Go to Settings → Git
2. Verify:
   - ✅ Repository is connected: `ShopCrazy1K/Shop-Crazy`
   - ✅ Production branch: `main`
   - ✅ Auto-deploy is **ENABLED**

---

### Option 3: Force Deployment via Git

If auto-deploy is enabled but not working:

1. **Make a small change to trigger deployment:**
   ```bash
   cd /Users/ronhart/social-app
   echo "// Deployment trigger $(date)" >> shop-crazy-market/next.config.js
   git add shop-crazy-market/next.config.js
   git commit -m "Trigger deployment"
   git push origin main
   ```

2. **Wait 1-2 minutes** for Vercel to detect the push

3. **Check Vercel dashboard** for new deployment

---

### Option 4: Check Deployment Logs

If deployments are failing:

1. Go to Vercel → Deployments
2. Click on a failed deployment (red status)
3. Check **"Build Logs"** for errors
4. Common issues:
   - Missing environment variables
   - Build command failures
   - Prisma generation errors

---

### Option 5: Verify Git Connection

1. **Check if Vercel can access your repo:**
   - Vercel → Settings → Git
   - Verify repository shows: `ShopCrazy1K/Shop-Crazy`
   - Check for any connection errors

2. **Reconnect if needed:**
   - Click "Disconnect"
   - Click "Connect Git Repository"
   - Re-authenticate with GitHub
   - Select your repository

---

## 🔍 Troubleshooting Checklist

- [ ] Changes are committed and pushed to `main` branch
- [ ] Vercel project is connected to correct GitHub repository
- [ ] Auto-deploy is enabled in Vercel settings
- [ ] Root directory is correctly configured (if using subdirectory)
- [ ] Latest deployment in Vercel shows the correct commit hash
- [ ] Build logs show no errors
- [ ] Environment variables are set correctly
- [ ] Browser cache is cleared (try hard refresh: Cmd+Shift+R)

---

## 📋 Current Commit Status

**Latest commit:** `cd92dd5` - "Fix notification bell click handler and z-index issues"

**Pushed to:** `origin/main` ✅

**Files changed:**
- `shop-crazy-market/components/NotificationBell.tsx`
- `shop-crazy-market/DEPLOYMENT_TROUBLESHOOTING.md`

---

## 🆘 If Nothing Works

1. **Check Vercel project name:**
   - The project might be named differently
   - Look for projects matching: `shop-crazy-market`, `Shop-Crazy`, `true-talk`

2. **Verify repository branch:**
   - Ensure you're pushing to the same branch Vercel monitors (usually `main`)

3. **Check for multiple Vercel projects:**
   - You might have multiple projects connected to the same repo
   - Only one might have auto-deploy enabled

4. **Contact Vercel Support:**
   - If deployments aren't triggering automatically
   - Check Vercel status page for service issues

---

## ✅ Success Indicators

You'll know deployment worked when:
- ✅ New deployment appears in Vercel dashboard
- ✅ Build status shows "Ready" (green)
- ✅ Changes appear on your live site
- ✅ Notification bell works correctly
