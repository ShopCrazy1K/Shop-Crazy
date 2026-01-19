# Fix: "This action requires merchant approval for read_products scope"

## Problem
Even after reconnecting, the error persists. This means the **permissions aren't enabled in your Shopify Partners Dashboard**.

## Critical Fix: Configure Permissions in Shopify Partners Dashboard

The scopes need to be **configured in Shopify Partners Dashboard FIRST** before they can be requested during OAuth.

### Step 1: Check App Permissions in Shopify Partners

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Click on your app: **Press&Go** (or your app name)
3. Go to **App setup** → **Permissions**
4. Look for the permissions/scopes section

### Step 2: Enable Required Permissions

You need to enable these permissions in your Shopify app:

**Required for Product Sync:**
- ✅ **Read products** (`read_products`)
- ✅ **Write products** (`write_products`) 
- ✅ **Read orders** (`read_orders`)
- ✅ **Write orders** (`write_orders`)

**How to Enable:**
1. In **App setup** → **Permissions** (or **Configuration**)
2. Find the permissions list
3. Enable/turn ON:
   - Products → Read access
   - Products → Write access  
   - Orders → Read access
   - Orders → Write access
4. **Save** the changes

### Step 3: Update App Configuration

After enabling permissions:

1. Go to **App setup** → **App configuration** or **Configuration**
2. Make sure your app is set to request these scopes
3. Some apps have a "Scopes" or "API Scopes" field - set it to:
   ```
   read_products,write_products,read_orders,write_orders
   ```
4. **Save** if you made changes

### Step 4: Uninstall and Reinstall the App

After enabling permissions:

1. **In your Shopify store admin:**
   - Go to **Settings** → **Apps and sales channels**
   - Find your app (Press&Go)
   - Click **Uninstall** or **Remove**
   - Confirm uninstallation

2. **Wait 1-2 minutes** for the app to be fully uninstalled

3. **Reconnect from your marketplace:**
   - Go to: `https://shopcrazymarket.com/seller/platforms`
   - Click "Connect Platform" → "Shopify"
   - Enter your store name
   - Click "Connect with Shopify"

4. **On Shopify authorization page:**
   - You should now see all the permissions listed
   - Make sure ALL permissions are checked/approved
   - Click **"Install app"** or **"Authorize"**

### Step 5: Verify Permissions Were Granted

After reconnecting, the sync should work. If you still get an error:

1. Check the browser console (F12) for the granted scopes log
2. The error message will show what scopes were granted vs what's missing

## Important Notes

⚠️ **Permissions must be enabled in Shopify Partners Dashboard FIRST**
- The app can't request permissions that aren't configured in Partners Dashboard
- Just having the scopes in the environment variable isn't enough
- The app needs to be configured to request these scopes

⚠️ **After enabling permissions, you MUST:**
- Uninstall the app from your Shopify store
- Reconnect/Reinstall to get new permissions

⚠️ **Old installations don't get new permissions automatically**
- If the app was installed before permissions were enabled, it won't have them
- You need to uninstall and reinstall

## Check Your Current Configuration

1. **Shopify Partners Dashboard** → Your App → **App setup** → **Permissions**
   - Should show: read_products, write_products, read_orders, write_orders

2. **Environment Variable in Vercel:**
   - `SHOPIFY_SCOPES` = `read_products,write_products,read_orders,write_orders`
   - Should match what's in Partners Dashboard

## Still Not Working?

If permissions are enabled but still not working:

1. **Check if the app is approved/published:**
   - Some permissions require the app to be published
   - Development apps might have restrictions

2. **Try creating a new app:**
   - Sometimes creating a fresh app with all permissions configured from the start works better

3. **Check Shopify API version:**
   - The code uses `2024-01` API version
   - Make sure your app supports this version

## Quick Test

After enabling permissions and reinstalling, visit:
```
https://shopcrazymarket.com/api/shopify/debug
```

Check the logs for "Shopify OAuth granted scopes" to see what was actually granted.
