# Fix: Missing read_products Scope - Complete Guide

## Current Error
```
Missing required scopes: read_products
Granted scopes: write_inventory,write_orders,write_products
```

## Root Cause
Your app is **requesting** `read_products` but Shopify is **only granting** write permissions. This happens when:
1. The `SHOPIFY_SCOPES` environment variable doesn't include `read_products`, OR
2. The permission isn't enabled in Shopify Partners Dashboard, OR
3. The app was installed before the permission was enabled

## Step-by-Step Fix

### Step 1: Verify Environment Variable

**Check what scopes are being requested:**

1. Visit: `https://shopcrazymarket.com/api/shopify/debug`
2. Look for the `scopes` field in the response
3. It should show: `read_products,write_products,read_orders,write_orders`

**If `read_products` is missing from the scopes:**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `SHOPIFY_SCOPES`
3. Make sure it's set to: `read_products,write_products,read_orders,write_orders`
4. **Important:** Check ALL environments (Production, Preview, Development)
5. **Redeploy** after changing environment variables

### Step 2: Enable Permission in Shopify Partners Dashboard

**This is the most common issue:**

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Click on your app: **Press&Go** (or your app name)
3. Go to **App setup** → **Permissions** (or **Configuration** → **Permissions**)

4. In the **Products** section, you'll see separate toggles:
   - ✅ **Read products** (`read_products`) - **ENABLE THIS!**
   - ✅ Write products (`write_products`) - Already enabled
   
5. **Also check these sections:**
   - **Orders**: Enable both "Read orders" and "Write orders"
   - **Inventory**: You can enable "Write inventory" if needed

6. **Save** the changes

### Step 3: Verify Permission is Enabled

After saving, double-check:
- The "Read products" toggle should be **ON** (green/enabled)
- The permission should show in the list as `read_products`

### Step 4: Uninstall the App from Your Store

**Critical:** Existing installations won't get new permissions automatically.

1. **In your Shopify store admin:**
   - Go to: `https://YOUR-STORE.myshopify.com/admin/settings/apps`
   - Or: **Settings** → **Apps and sales channels**
   - Find **Press&Go** (or your app name)
   - Click **Uninstall** or **Remove**
   - Confirm uninstallation

2. **Wait 1-2 minutes** for the app to be fully removed

### Step 5: Reconnect from Your Marketplace

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. If you see your Shopify connection still listed:
   - Click **"Disconnect"** button
   - Wait for it to disconnect
3. Click **"Connect Platform"** → **"Shopify"**
4. Enter your store name (e.g., `shopcrazymarket` or `shopcrazymarket.myshopify.com`)
5. Click **"Connect with Shopify"**

### Step 6: Approve All Permissions

**On the Shopify authorization page:**

1. You should see a list of permissions the app is requesting
2. **Look for "Read products"** - it should be in the list now
3. Make sure **ALL** permissions are checked/approved:
   - ✅ Read products
   - ✅ Write products
   - ✅ Read orders
   - ✅ Write orders
4. Click **"Install app"** or **"Authorize"**

### Step 7: Verify Scopes Were Granted

After reconnecting:

1. Try syncing products again
2. If you still get an error, check the error message
3. It should now show: `Granted scopes: read_products,write_products,read_orders,write_orders`

## Troubleshooting

### Still getting "Missing read_products" after following all steps?

**Check 1: Environment Variable**
- Visit `/api/shopify/debug` and verify `scopes` includes `read_products`
- If not, update `SHOPIFY_SCOPES` in Vercel and redeploy

**Check 2: Partners Dashboard**
- Go back to Partners Dashboard → Permissions
- Make absolutely sure "Read products" toggle is **ON** (not just "Write products")
- Some apps have separate read/write toggles

**Check 3: App Type**
- Custom apps should have all permissions available
- If you're using a public app, make sure it's not restricted

**Check 4: Browser Cache**
- Clear your browser cache
- Try reconnecting in an incognito/private window

**Check 5: Wait Time**
- Sometimes Shopify takes a few minutes to propagate permission changes
- Wait 5-10 minutes after enabling permissions before reconnecting

### The permission is enabled but still not granted?

1. **Create a new app** in Partners Dashboard:
   - Sometimes starting fresh works better
   - Configure all permissions from the start
   - Use the new app's API key/secret

2. **Check API version compatibility:**
   - Make sure your app supports the API version (2024-01)
   - Some older API versions may have different scope requirements

## Quick Checklist

- [ ] Checked `/api/shopify/debug` - scopes include `read_products`
- [ ] Updated `SHOPIFY_SCOPES` in Vercel if needed
- [ ] Redeployed after changing environment variables
- [ ] Enabled "Read products" in Shopify Partners Dashboard
- [ ] Saved changes in Partners Dashboard
- [ ] Uninstalled app from Shopify store
- [ ] Waited 1-2 minutes after uninstall
- [ ] Disconnected from marketplace (if still connected)
- [ ] Reconnected from marketplace
- [ ] Approved all permissions during authorization
- [ ] Verified granted scopes include `read_products`

## Why This Happens

Shopify requires you to:
1. **Request** the scope in your OAuth URL (via `SHOPIFY_SCOPES`)
2. **Enable** the permission in Partners Dashboard
3. **Reinstall** the app to get new permissions

If any of these steps are missing, the scope won't be granted.

## Next Steps After Fix

Once `read_products` is granted:
- Product sync should work
- You'll be able to fetch products from Shopify
- The error message should disappear

If you still have issues after following this guide, the problem might be:
- API version mismatch
- App configuration issue in Partners Dashboard
- Network/firewall blocking Shopify API calls
