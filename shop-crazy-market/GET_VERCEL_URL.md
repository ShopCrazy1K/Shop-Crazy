# How to Get Your Vercel URL (NEXT_PUBLIC_SITE_URL)

## Quick Steps

### Step 1: Go to Deployments

**Direct Link:**
https://vercel.com/shop-crazy-markets-projects/social-app/deployments

**OR navigate:**
1. Go to: https://vercel.com
2. Click on your project: **"social-app"**
3. Click **"Deployments"** tab (top menu)

### Step 2: Find Your URL

You'll see a list of deployments. Look for:

1. **Latest deployment** (top of the list)
2. **Status:** Should show "Ready", "Building", or "Error"
3. **URL/Domain:** 
   - Click on the deployment card
   - OR look for a link/button that says "Visit" or shows the URL
   - The URL will be displayed somewhere on the deployment page

### Step 3: Copy the URL

The URL format will be one of:
- `https://social-app-[random-hash].vercel.app`
- `https://[project-name].vercel.app`
- Or your custom domain if configured

**Example:**
```
https://social-app-abc123xyz.vercel.app
```

### Step 4: Use as NEXT_PUBLIC_SITE_URL

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. Add/Edit:
   - **Key:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://your-actual-url.vercel.app` (paste your URL)
   - **Environments:** Production, Preview
   - **Save**

## If Deployment is Still Building

If your deployment is still building:

1. **Wait for it to complete** (status: "Ready")
2. **Then get the URL** from the completed deployment
3. **Add it to environment variables**
4. **Redeploy** so it picks up the new variable

## If No Deployments Yet

If you don't see any deployments:

1. Make sure repository is connected
2. Make sure Root Directory is set to `shop-crazy-market`
3. Trigger a deployment:
   - Go to Deployments tab
   - Click "Deploy" button
   - Or push a new commit

## Alternative: Check Project Settings

You can also find your domain in:

1. **Settings → Domains:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/domains

2. Look for your **Vercel-assigned domain**

## Temporary Placeholder

If you need to deploy NOW and don't have the URL yet:

1. Use a placeholder:
   ```
   https://social-app.vercel.app
   ```

2. After deployment completes:
   - Get the actual URL
   - Update `NEXT_PUBLIC_SITE_URL` with the real URL
   - Redeploy

---

**Once you have your Vercel URL, use it as the value for `NEXT_PUBLIC_SITE_URL`!**

