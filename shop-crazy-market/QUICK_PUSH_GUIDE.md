# 🚀 Quick Push Guide - I'll Help You!

I've created a helper script to make this easy. Follow these steps:

## Step 1: Get Your GitHub Token (2 minutes)

1. **Open this link:**
   https://github.com/settings/tokens

2. **Click:** "Generate new token" → "Generate new token (classic)"

3. **Fill in:**
   - **Note:** `Shop-Crazy Deploy`
   - **Expiration:** 90 days (or your preference)
   - **Scopes:** Check ✅ **`repo`** (Full control of private repositories)

4. **Click:** "Generate token" at the bottom

5. **Copy the token** (starts with `ghp_` or similar)
   - ⚠️ **Important:** Copy it now - you won't see it again!

## Step 2: Run the Push Script

I've created a helper script. Just run:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
./push-with-token.sh
```

When prompted, paste your token and press Enter.

**OR** if you prefer to do it manually:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
git remote set-url origin https://[YOUR_TOKEN]@github.com/ShopCrazy1K/Shop-Crazy.git
git push -u origin main
```

Replace `[YOUR_TOKEN]` with your actual token.

## Step 3: Verify Push

After pushing, check:
- https://github.com/ShopCrazy1K/Shop-Crazy
- You should see all your files!

## Step 4: Connect to Vercel

Once code is pushed:

1. **Go to Vercel:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect Repository:**
   - Click "Connect Git Repository"
   - Search: `ShopCrazy1K/Shop-Crazy`
   - Select and connect

3. **Set Root Directory:**
   - Settings → General
   - Root Directory: `shop-crazy-market`
   - Save

4. **Deploy:**
   - Vercel will auto-deploy
   - OR go to Deployments → Click "Deploy"

---

## Alternative: Add Collaborator

If you have access to the `ShopCrazy1K` GitHub account:

1. Go to: https://github.com/ShopCrazy1K/Shop-Crazy/settings/access
2. Click "Add people"
3. Search: `shart1000n-ship-it`
4. Add with "Write" permission
5. Accept invitation email
6. Then just run: `git push -u origin main`

---

**Need help?** Let me know once you have the token and I'll help you push!

