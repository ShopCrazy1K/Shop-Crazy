# Push Code to ShopCrazy1K/Shop-Crazy

## Repository URL
**https://github.com/ShopCrazy1K/Shop-Crazy.git**

## Current Issue
- Remote is set correctly ✅
- Authentication failed ❌ (403 Permission Denied)
- You're authenticated as: `shart1000n-ship-it`
- Repository owner: `ShopCrazy1K`

## Solution Options

### Option 1: Add Collaborator (Easiest)

1. **Go to repository settings:**
   - https://github.com/ShopCrazy1K/Shop-Crazy/settings/access

2. **Add collaborator:**
   - Click "Add people"
   - Search for: `shart1000n-ship-it`
   - Add with "Write" permission
   - Accept the invitation email

3. **Push code:**
   ```bash
   cd /Users/ronhart/social-app/shop-crazy-market
   git add .
   git commit -m "Initial commit: Shop Crazy Market"
   git push -u origin main
   ```

### Option 2: Use Personal Access Token

1. **Create token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "Shop-Crazy Deploy"
   - Scopes: Check `repo` (full control)
   - Generate and copy token

2. **Push with token:**
   ```bash
   cd /Users/ronhart/social-app/shop-crazy-market
   git add .
   git commit -m "Initial commit: Shop Crazy Market"
   git push https://[YOUR_TOKEN]@github.com/ShopCrazy1K/Shop-Crazy.git main
   ```

### Option 3: Use SSH (If configured)

1. **Update remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:ShopCrazy1K/Shop-Crazy.git
   ```

2. **Push:**
   ```bash
   git add .
   git commit -m "Initial commit: Shop Crazy Market"
   git push -u origin main
   ```

## After Pushing

### Connect in Vercel

1. **Go to Vercel:**
   - https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect repository:**
   - Click "Connect Git Repository"
   - Search: `ShopCrazy1K/Shop-Crazy`
   - Select it
   - Grant permissions

3. **Set Root Directory:**
   - Settings → General
   - Root Directory: `shop-crazy-market`
   - Save

4. **Deploy:**
   - Go to Deployments tab
   - Click "Deploy" or wait for auto-deploy

## Environment Variables in Vercel

Don't forget to add these in Vercel Settings → Environment Variables:

- `DATABASE_URL` (from Supabase)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` (your Vercel URL)

See `.env.example` for full list.

