# Fix: Vercel Detecting Vite Instead of Next.js

## Problem
Vercel is detecting Vite from the root directory instead of Next.js from `shop-crazy-market` subdirectory.

## Root Cause
Your repository has:
- Root: Vite project (`vite.config.ts`, `package.json` with Vite)
- Subdirectory: Next.js project (`shop-crazy-market/`)

Vercel is looking at the root and detecting Vite.

## Solution: Set Root Directory in Vercel

### Step 1: Configure Root Directory

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/general
2. Scroll to **"Root Directory"**
3. Click **"Edit"**
4. Enter: `shop-crazy-market`
5. Click **"Save"**

This tells Vercel to:
- Look inside `shop-crazy-market/` folder
- Find `next.config.js` (Next.js)
- Ignore root `vite.config.ts` (Vite)

### Step 2: Verify Framework Detection

After setting Root Directory:
- Vercel should detect: **Next.js**
- Build Command: `npm run build` (from shop-crazy-market)
- Output Directory: `.next`

### Step 3: Deploy

1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Or push to main branch to trigger auto-deploy

## Verification

After setting Root Directory, check:
- ✅ Framework shows "Next.js" (not Vite)
- ✅ Build Command is `npm run build`
- ✅ Root Directory shows `shop-crazy-market`

## Why This Happens

Vercel auto-detects framework by looking for:
- `next.config.js` → Next.js
- `vite.config.ts` → Vite
- `package.json` scripts → Framework detection

Since your root has Vite config, Vercel detects Vite unless you specify the Root Directory.

## Quick Fix

**Set Root Directory to `shop-crazy-market` in Vercel Settings → General**

This is the most important step! Once set, Vercel will correctly detect Next.js.

