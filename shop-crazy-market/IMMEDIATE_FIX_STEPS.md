# IMMEDIATE FIX: Missing read_products Scope

## Your Current Error
```
Missing required scopes: read_products
Granted scopes: write_inventory,write_orders,write_products
```

## Root Cause
The "Read products" permission is **NOT enabled** in your Shopify Partners Dashboard, OR the app was installed before enabling it.

## ✅ STEP-BY-STEP FIX (DO THIS NOW)

### STEP 1: Verify What Scopes Are Being Requested

1. Visit this URL to check:
   ```
   https://shopcrazymarket.com/api/shopify/verify-scopes
   ```
2. Look at the response - it should show `hasReadProducts: true`
3. This confirms our code is requesting `read_products` correctly

### STEP 2: Enable Permission in Shopify Partners Dashboard ⚠️ REQUIRED

**THIS IS THE CRITICAL STEP:**

1. **Go to:** https://partners.shopify.com
2. **Login** with your Shopify Partners account
3. **Click** on your app (likely named "Press&Go" or similar)
4. **Click** "App setup" in the left sidebar
5. **Click** "Permissions" (or find it under "Configuration")
6. **Find** the "Products" section
7. **You'll see TWO separate toggles:**
   - ✅ "Write products" - This is probably ENABLED (green/on)
   - ❌ "Read products" - This is probably DISABLED (gray/off) ← **ENABLE THIS!**
8. **Click the toggle** to enable "Read products"
9. **Also check:**
   - "Read orders" should be enabled
   - "Write orders" should be enabled
10. **Click "Save"** at the bottom of the page

### STEP 3: Uninstall the App from Your Store ⚠️ REQUIRED

**Existing installations DON'T get new permissions automatically!**

1. **Go to your Shopify store admin:**
   - URL: `https://YOUR-STORE-NAME.myshopify.com/admin`
   - Or go to: https://admin.shopify.com and select your store
2. **Navigate to:** Settings → Apps and sales channels
   - OR go directly to: `https://YOUR-STORE-NAME.myshopify.com/admin/settings/apps`
3. **Find** your app (Press&Go or similar)
4. **Click** "Uninstall" or "Remove"
5. **Confirm** the uninstallation
6. **Wait 1-2 minutes** for it to fully remove

### STEP 4: Reconnect from Your Marketplace

1. **Go to:** https://shopcrazymarket.com/seller/platforms
2. **If you see** your Shopify connection still listed:
   - Click the **"Disconnect"** button
   - Wait for it to disconnect
3. **Click** "Connect Platform" → "Shopify"
4. **Enter** your store name (e.g., `shopcrazymarket` or just the shop name without `.myshopify.com`)
5. **Click** "Connect with Shopify"

### STEP 5: Approve All Permissions on Authorization Page

**When Shopify asks for permissions:**

1. **You should see** a list of permissions the app needs
2. **Look for "Read products"** - it should be in the list now!
3. **Make sure ALL** permissions are checked:
   - ✅ Read products ← **THIS SHOULD BE HERE NOW!**
   - ✅ Write products
   - ✅ Read orders
   - ✅ Write orders
4. **Click** "Install app" or "Authorize"

### STEP 6: Test Sync

1. After reconnecting, go back to: https://shopcrazymarket.com/seller/platforms
2. Click **"Sync Products"** next to your Shopify connection
3. It should work now! ✅

## 🔍 TROUBLESHOOTING

### If you still get "Missing read_products" after following all steps:

**Check 1: Did you actually enable "Read products" in Partners Dashboard?**
- Go back and double-check
- The toggle should be GREEN/ON
- Make sure you clicked "Save"

**Check 2: Did you uninstall the app?**
- Go back to your Shopify store admin
- Check if the app is still installed
- If it's still there, uninstall it and wait 2 minutes

**Check 3: Did you reconnect after uninstalling?**
- The app MUST be reinstalled to get new permissions
- Just updating Partners Dashboard isn't enough

**Check 4: Check environment variable**
- Visit: https://shopcrazymarket.com/api/shopify/debug
- Look at `scopesActual` - it should include `read_products`
- If not, check `SHOPIFY_SCOPES` in Vercel

## 📝 QUICK CHECKLIST

- [ ] Visited `/api/shopify/verify-scopes` - confirmed `read_products` is requested
- [ ] Went to Shopify Partners Dashboard
- [ ] Found "App setup" → "Permissions"
- [ ] Enabled "Read products" toggle (made it green/on)
- [ ] Clicked "Save" in Partners Dashboard
- [ ] Went to Shopify store admin
- [ ] Went to "Settings" → "Apps and sales channels"
- [ ] Found the app and clicked "Uninstall"
- [ ] Confirmed uninstallation
- [ ] Waited 1-2 minutes after uninstall
- [ ] Went to `/seller/platforms` on your marketplace
- [ ] Clicked "Disconnect" if still connected
- [ ] Clicked "Connect Platform" → "Shopify"
- [ ] Entered store name and clicked "Connect with Shopify"
- [ ] On authorization page, saw "Read products" in permission list
- [ ] Approved all permissions
- [ ] Clicked "Install app"
- [ ] Tested sync - it worked! ✅

## ⚠️ IMPORTANT NOTES

1. **You MUST uninstall and reinstall** - just enabling permission in Partners Dashboard isn't enough
2. **Wait 1-2 minutes** after uninstalling before reconnecting
3. **The permission must be enabled in Partners Dashboard FIRST** before reinstalling
4. **If you skip any step, it won't work**

## ✅ After Fix

Once `read_products` is granted, the error will disappear and product sync will work!

---

**If you've followed ALL these steps and it still doesn't work, let me know and I'll help debug further.**
