# Fix: Missing read_products Scope

## Current Status
- ✅ **Granted scopes**: `write_inventory,write_orders,write_products`
- ❌ **Missing scope**: `read_products`

Your app has **write** permissions but **NOT read** permissions. This is why sync fails - you can't read products without `read_products` scope.

## Solution: Enable Read Products Permission

### Step 1: Go to Shopify Partners Dashboard

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Click on your app: **Press&Go** (or your app name)
3. Go to **App setup** → **Permissions** (or **Configuration** → **Permissions**)

### Step 2: Enable Read Products Permission

Look for the **Products** section and enable:

**Required:**
- ✅ **Read products** (`read_products`) - **THIS IS MISSING!**
- ✅ Write products (`write_products`) - Already enabled ✅

**Also check:**
- ✅ Read orders (`read_orders`) - Should be enabled
- ✅ Write orders (`write_orders`) - Already enabled ✅

### Step 3: Save Changes

1. **Save** the permission changes in Partners Dashboard
2. Wait 1-2 minutes for changes to take effect

### Step 4: Uninstall and Reinstall the App

**This is critical** - existing installations won't get new permissions automatically:

1. **In your Shopify store admin:**
   - Go to **Settings** → **Apps and sales channels**
   - Find **Press&Go** (or your app name)
   - Click **Uninstall** or **Remove**
   - Confirm uninstallation

2. **Wait 1-2 minutes** for the app to be fully uninstalled

3. **Reconnect from your marketplace:**
   - Go to: `https://shopcrazymarket.com/seller/platforms`
   - Click **"Disconnect"** if still connected
   - Click **"Connect Platform"** → **"Shopify"**
   - Enter your store name
   - Click **"Connect with Shopify"**

4. **On Shopify authorization page:**
   - You should now see **"Read products"** in the permissions list
   - Make sure ALL permissions are checked/approved
   - Click **"Install app"** or **"Authorize"**

### Step 5: Verify Scopes Were Granted

After reconnecting, try syncing again. The error message should now show:
- ✅ **Granted scopes**: `read_products,write_products,read_orders,write_orders`

## Why This Happened

Your app was configured with only **write** permissions, but product sync requires **read** permissions to fetch products from Shopify.

## Quick Checklist

- [ ] Enabled "Read products" permission in Shopify Partners Dashboard
- [ ] Saved changes in Partners Dashboard
- [ ] Uninstalled app from Shopify store
- [ ] Reconnected from marketplace
- [ ] Approved all permissions during authorization
- [ ] Verified granted scopes include `read_products`

## Still Not Working?

If `read_products` still isn't granted after following these steps:

1. **Double-check Partners Dashboard:**
   - Make sure "Read products" is enabled (not just "Write products")
   - Some apps have separate toggles for read vs write

2. **Check App Type:**
   - Custom apps should have all permissions available
   - Public apps may have restrictions

3. **Try creating a new app:**
   - Sometimes starting fresh with all permissions configured from the start works better

4. **Check API version:**
   - Make sure your app supports the API version being used (2024-01)

The key is: **You MUST enable "Read products" in Partners Dashboard AND reinstall the app** for it to work.
