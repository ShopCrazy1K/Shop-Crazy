# Shopify Configuration Status Check

## ✅ What's Working

1. **API Key**: ✅ Configured (32 characters)
2. **API Secret**: ✅ Configured (38 characters)
3. **Scopes**: ✅ Set correctly (`read_products,write_products,read_orders,write_orders`)

## ❌ Issues Found

### Critical Issue #1: Wrong App URL

**Current Status:**
- App URL: `https://press-go.vercel.app` ❌
- Should be: `https://shopcrazymarket.com` ✅

**Redirect URI:**
- Current: `https://press-go.vercel.app/api/shopify/oauth/callback` ❌
- Should be: `https://shopcrazymarket.com/api/shopify/oauth/callback` ✅

### Critical Issue #2: Environment Variable Missing

**Missing:**
- `NEXT_PUBLIC_APP_URL` is "not set" ❌

## 🔧 What You Need to Fix

### Step 1: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Navigate to your project: **Shop Crazy Market**
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   NEXT_PUBLIC_APP_URL = https://shopcrazymarket.com
   ```
5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your application (Settings → Deployments → Redeploy)

### Step 2: Update Shopify App Redirect URI

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Select your app
3. Go to **App setup** → **Allowed redirection URL(s)**
4. Remove: `https://press-go.vercel.app/api/shopify/oauth/callback`
5. Add: `https://shopcrazymarket.com/api/shopify/oauth/callback`
6. **Save** the changes

### Step 3: Verify App URL in Shopify

1. In Shopify Partners Dashboard → Your App
2. Go to **App setup** → **App URL**
3. Make sure it's set to: `https://shopcrazymarket.com/api/shopify/app`
4. **Save** if needed

### Step 4: Verify After Changes

After making the changes and redeploying, check:

1. Visit: `https://shopcrazymarket.com/api/shopify/debug`
2. Verify:
   - ✅ `appUrl` shows: `https://shopcrazymarket.com`
   - ✅ `redirectUri` shows: `https://shopcrazymarket.com/api/shopify/oauth/callback`
   - ✅ `nextPublicAppUrl` shows: `https://shopcrazymarket.com`

## ✅ Complete Checklist

- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://shopcrazymarket.com` in Vercel
- [ ] Application has been redeployed after setting environment variable
- [ ] Redirect URI in Shopify Partners is: `https://shopcrazymarket.com/api/shopify/oauth/callback`
- [ ] App URL in Shopify Partners is: `https://shopcrazymarket.com/api/shopify/app`
- [ ] Debug endpoint shows correct redirect URI
- [ ] Tested OAuth connection flow

## 🧪 Test the Connection

After fixing the configuration:

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. Click "Connect Platform"
3. Select "Shopify"
4. Enter your Shopify store name
5. Click "Connect with Shopify"
6. You should be redirected to Shopify to authorize
7. After authorization, you should be redirected back successfully

## Current Configuration Status

As of the last check:

```json
{
  "appUrl": "https://press-go.vercel.app",  // ❌ WRONG
  "redirectUri": "https://press-go.vercel.app/api/shopify/oauth/callback",  // ❌ WRONG
  "nextPublicAppUrl": "not set",  // ❌ MISSING
  "hasApiKey": true,  // ✅ GOOD
  "hasApiSecret": true  // ✅ GOOD
}
```

## Expected Configuration

After fixes:

```json
{
  "appUrl": "https://shopcrazymarket.com",  // ✅ CORRECT
  "redirectUri": "https://shopcrazymarket.com/api/shopify/oauth/callback",  // ✅ CORRECT
  "nextPublicAppUrl": "https://shopcrazymarket.com",  // ✅ CORRECT
  "hasApiKey": true,  // ✅ GOOD
  "hasApiSecret": true  // ✅ GOOD
}
```

## Need Help?

If you're still having issues after following these steps:

1. Check the error message on the `/seller/platforms` page
2. Check browser console for any JavaScript errors
3. Check Vercel deployment logs for server errors
4. Verify the redirect URI matches EXACTLY (no trailing slashes, correct protocol)
