# Remove vercel.json Settings from Vercel Dashboard

## Quick Steps (2 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project

2. **Remove vercel.json Settings**
   - Go to: **Settings** → **General**
   - Scroll to **"Build & Development Settings"**
   - Look for:
     - ❌ Any "Ignore Build Step" configuration
     - ❌ Any custom `vercel.json` settings
     - ❌ Any "Output Directory" that's not `.next`
   - **Remove/clear all of these**
   - Leave only:
     - ✅ Framework: Next.js (auto-detected)
     - ✅ Build Command: (empty - auto-detected)
     - ✅ Output Directory: (empty - auto-detected)
     - ✅ Install Command: `npm install && npx prisma generate`

3. **Save Settings**
   - Click **"Save"** at the bottom

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or wait for auto-deploy from the latest commit

## What to Look For

In **Settings → General → Build & Development Settings**, you might see:
- ❌ "Ignore Build Step" - Remove this
- ❌ Custom "Output Directory" - Clear this (should be empty)
- ❌ Custom "Build Command" - Clear this (should be empty)
- ✅ "Install Command" - Keep: `npm install && npx prisma generate`
- ✅ "Framework Preset" - Should be "Next.js"

## After Removing

The build should work because:
- ✅ No conflicting `vercel.json` settings
- ✅ Next.js auto-detects everything
- ✅ Only Install Command is needed for Prisma

## Alternative: Delete and Re-import Project

If settings are stuck:
1. **Export environment variables** (copy them)
2. **Delete the project** in Vercel
3. **Re-import**: Add New Project → Import ShopCrazy1K/Shop-Crazy
4. **Set Install Command**: `npm install && npx prisma generate`
5. **Add environment variables** back
6. **Deploy**

This ensures a clean start with no old settings.

