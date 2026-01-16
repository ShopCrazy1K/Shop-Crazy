# ❌ Shopify Connection Issue - ROOT CAUSE FOUND

## Current Problem

Your app is using the **WRONG domain** for the redirect URI:

**Current Configuration:**
- ❌ App URL: `https://press-go.vercel.app`
- ❌ Redirect URI: `https://press-go.vercel.app/api/shopify/oauth/callback`
- ❌ `NEXT_PUBLIC_APP_URL`: **NOT SET**

**Should Be:**
- ✅ App URL: `https://shopcrazymarket.com`
- ✅ Redirect URI: `https://shopcrazymarket.com/api/shopify/oauth/callback`
- ✅ `NEXT_PUBLIC_APP_URL`: `https://shopcrazymarket.com`

## Why It's Not Connecting

Shopify checks that the redirect URI in your OAuth request **EXACTLY matches** what's configured in your Shopify Partners Dashboard. Right now:

1. Your app is generating OAuth requests with: `https://press-go.vercel.app/api/shopify/oauth/callback`
2. But in Shopify Partners Dashboard, you probably configured: `https://shopcrazymarket.com/api/shopify/oauth/callback`
3. **These don't match** → Shopify rejects the connection → OAuth fails

## ✅ Fix Steps (REQUIRED)

### Step 1: Set Environment Variable in Vercel (CRITICAL)

**This is the #1 fix you need:**

1. Go to: https://vercel.com/dashboard
2. Select your project: **Shop Crazy Market** (or whatever it's named)
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Add this variable:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://shopcrazymarket.com`
   - **Environment**: Check all three: Production, Preview, Development
6. Click **Save**
7. **IMPORTANT**: Go to **Deployments** tab and click **Redeploy** (or it will deploy on next push)

### Step 2: Verify in Shopify Partners Dashboard

1. Go to: https://partners.shopify.com
2. Select your app
3. Go to **App setup** → **Allowed redirection URL(s)**
4. Make sure this EXACT URL is listed:
   ```
   https://shopcrazymarket.com/api/shopify/oauth/callback
   ```
5. If you see `https://press-go.vercel.app/api/shopify/oauth/callback` in the list, **remove it**
6. Click **Save**

### Step 3: Verify App URL in Shopify

1. In Shopify Partners Dashboard → Your App
2. Go to **App setup** → **App URL**
3. Should be: `https://shopcrazymarket.com/api/shopify/app`
4. If different, update it and **Save**

### Step 4: Verify After Fix

After setting the environment variable and redeploying:

1. Wait 2-3 minutes for deployment to complete
2. Visit: `https://shopcrazymarket.com/api/shopify/debug`
3. Check the response - it should show:
   ```json
   {
     "appUrl": "https://shopcrazymarket.com",
     "redirectUri": "https://shopcrazymarket.com/api/shopify/oauth/callback",
     "nextPublicAppUrl": "https://shopcrazymarket.com"
   }
   ```
4. If all three show `shopcrazymarket.com`, you're good!

### Step 5: Test the Connection

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. Click **"Connect Platform"**
3. Select **"Shopify"**
4. Enter your Shopify store name (e.g., "my-store" for my-store.myshopify.com)
5. Click **"Connect with Shopify"**
6. You should be redirected to Shopify to authorize
7. After clicking "Install" on Shopify, you should be redirected back successfully

## Common Error Messages & Solutions

### Error: "redirect_uri_mismatch"
**Cause**: Redirect URI in OAuth request doesn't match Shopify configuration  
**Fix**: Follow Steps 1-3 above to ensure both match exactly

### Error: "invalid_hmac"
**Cause**: HMAC verification failed (could be wrong API secret)  
**Fix**: Verify `SHOPIFY_API_SECRET` in Vercel matches what's in Shopify Partners Dashboard

### Error: "missing_params"
**Cause**: OAuth callback is missing required parameters  
**Fix**: Usually means the OAuth flow didn't complete properly - try again after fixing redirect URI

### Error: "oauth_failed"
**Cause**: Generic OAuth failure  
**Fix**: Check server logs, verify all environment variables are set correctly

## Checklist

Before testing again, verify:

- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://shopcrazymarket.com` in Vercel
- [ ] Application has been redeployed after setting environment variable
- [ ] Redirect URI in Shopify Partners is: `https://shopcrazymarket.com/api/shopify/oauth/callback`
- [ ] App URL in Shopify Partners is: `https://shopcrazymarket.com/api/shopify/app`
- [ ] Debug endpoint shows correct URLs
- [ ] Old `press-go.vercel.app` URLs are removed from Shopify configuration

## Still Not Working?

If you've completed all steps and it's still not working:

1. Check the error message on `/seller/platforms` page - it should now be more specific
2. Check Vercel deployment logs for server-side errors
3. Check browser console (F12 → Console) for client-side errors
4. Verify the debug endpoint shows the correct URLs after redeploy

## Quick Test

After making changes, run this command to verify:

```bash
curl https://shopcrazymarket.com/api/shopify/debug | grep -o '"redirectUri":"[^"]*"'
```

Should output:
```
"redirectUri":"https://shopcrazymarket.com/api/shopify/oauth/callback"
```

If it shows `press-go.vercel.app`, the environment variable wasn't set correctly or the app wasn't redeployed.
