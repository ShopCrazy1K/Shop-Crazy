# 🔧 Vercel Deployment Fix - Step by Step

## The Problem
Your Next.js app is in `shop-crazy-market/` but Vercel might be deploying from the root directory, so it can't find your app.

## The Fix (2 Methods)

---

## Method 1: Quick Fix via Vercel Dashboard ⚡ (Recommended - 2 minutes)

### Step 1: Open Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Find your project: `shop-crazy-market` (or whatever it's named)

### Step 2: Fix Root Directory
1. Click on your project
2. Go to **Settings** → **General**
3. Scroll down to **"Root Directory"**
4. **Click "Edit"**
5. **Change from:** (empty or `.`) 
6. **Change to:** `shop-crazy-market`
7. **Click "Save"**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on any deployment
3. Click **"Redeploy"**
4. Confirm **"Redeploy"**
5. Wait for deployment to complete

### ✅ Done! 
Your app should now deploy correctly with all your updates.

---

## Method 2: Auto-Fix Script 🤖

### Step 1: Run the Fix Script
```bash
cd /Users/ronhart/social-app/shop-crazy-market
bash AUTO_FIX_VERCEL.sh
```

### Step 2: Follow the Prompts
- The script will try to link your project
- It will verify configuration
- It will trigger a deployment

### Step 3: Still Verify in Dashboard
Even after running the script, **you must still check the Root Directory** in Vercel Dashboard (see Method 1, Step 2).

---

## Why This Fixes It

**Before (Wrong):**
```
Repository Root (.)
├── package.json (Vite/React app)
├── shop-crazy-market/
│   ├── package.json (Next.js app) ← Your app is here!
│   └── components/
│       └── NotificationBell.tsx ← Your changes!
```

Vercel looks in `.` → Finds wrong `package.json` → Deploys wrong app → Your changes never appear

**After (Correct):**
```
Repository Root (.)
└── shop-crazy-market/ ← Vercel looks HERE now
    ├── package.json (Next.js app) ✅
    └── components/
        └── NotificationBell.tsx ✅
```

Vercel looks in `shop-crazy-market/` → Finds correct `package.json` → Deploys your Next.js app → Your changes appear!

---

## Verify the Fix Worked

After updating Root Directory and redeploying:

1. **Check Deployment Logs:**
   - Should show: `Building from: shop-crazy-market/`
   - Should process: `components/NotificationBell.tsx`

2. **Check Live Site:**
   - Notification bell should work
   - Changes should be visible

3. **Check Commit Hash:**
   - Deployment should show latest commit: `fa5161e` or newer

---

## Still Not Working?

### Check These:

1. **Auto-Deploy Enabled?**
   - Settings → Git → Auto-deploy should be ON

2. **Correct Repository?**
   - Settings → Git → Should show: `ShopCrazy1K/Shop-Crazy`

3. **Correct Branch?**
   - Settings → Git → Production branch should be: `main`

4. **Build Logs:**
   - Check for errors in deployment logs
   - Look for "File not found" errors

---

## Quick Test

After fixing, test with:
```bash
cd /Users/ronhart/social-app
bash shop-crazy-market/trigger-deployment-simple.sh
```

Then check Vercel dashboard - you should see a new deployment start automatically!

---

## Summary

**The one setting that fixes everything:**
- **Vercel Dashboard** → **Settings** → **General** → **Root Directory**
- **Set to:** `shop-crazy-market`
- **Save** → **Redeploy**

That's it! 🎉
