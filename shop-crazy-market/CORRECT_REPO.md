# Correct Repository for Vercel

## Repository Name
**ShopCrazy1K/social-app**

## Connect in Vercel

### Step 1: Update Vercel Project Settings

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/git
2. Click **"Connect Git Repository"** (or "Change" if one is connected)
3. Search for: `ShopCrazy1K/social-app`
4. Select it
5. Grant permissions if needed
6. Click **"Connect"**

### Step 2: Verify Root Directory

1. Go to: Settings → General
2. Root Directory: `shop-crazy-market`
3. Save

### Step 3: Deploy

1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Or push to main branch to trigger auto-deploy

## Repository URL Format

For Vercel, use:
- **Owner/Repo**: `ShopCrazy1K/social-app`
- **Full URL**: `https://github.com/ShopCrazy1K/social-app`

## If Repository Doesn't Exist

If `ShopCrazy1K/social-app` doesn't exist:

1. Create it on GitHub
2. Push your code:
   ```bash
   git remote set-url origin https://github.com/ShopCrazy1K/social-app.git
   git push -u origin main
   ```
3. Then connect in Vercel

