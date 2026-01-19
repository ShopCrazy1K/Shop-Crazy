# Fix: "This action requires merchant approval for read_products scope"

## Problem
The error "This action requires merchant approval for read_products scope" means your Shopify app doesn't have permission to read products. This happens when:
1. The scopes weren't approved during OAuth
2. The app was connected before scopes were properly configured
3. The OAuth flow didn't request the correct scopes

## Solution: Reconnect with Correct Scopes

You need to disconnect and reconnect your Shopify store to request the correct scopes again.

### Step 1: Disconnect Shopify

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. Find your Shopify connection
3. Click **"Disconnect"**
4. Confirm the disconnection

### Step 2: Verify Scopes Configuration

1. Check your Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Look for `SHOPIFY_SCOPES`
   - It should be: `read_products,write_products,read_orders,write_orders`
   - If it's missing or different, add/update it

### Step 3: Reconnect Shopify

1. On the `/seller/platforms` page
2. Click **"Connect Platform"**
3. Select **"Shopify"**
4. Enter your Shopify store name (e.g., `shopcrazymarket`)
5. Click **"Connect with Shopify"**
6. **IMPORTANT**: When Shopify shows the authorization page, make sure to:
   - Review all the permissions requested
   - Click **"Install app"** or **"Authorize"** to approve all scopes

### Step 4: Verify Scopes Were Approved

After reconnecting, the scopes should be approved and sync should work.

## Required Scopes

Your app needs these scopes to sync products:
- ✅ `read_products` - Read product information
- ✅ `write_products` - Update products (for future sync updates)
- ✅ `read_orders` - Read order information
- ✅ `write_orders` - Create/update orders

## Check Current Configuration

To verify your scopes are configured correctly, visit:
```
https://shopcrazymarket.com/api/shopify/debug
```

You should see:
```json
{
  "scopes": "read_products,write_products,read_orders,write_orders"
}
```

## If Still Not Working

If you still get the scope error after reconnecting:

1. **Check Shopify Partners Dashboard:**
   - Go to your app in Shopify Partners
   - Check **"App setup"** → **"Permissions"** or **"Scopes"**
   - Make sure `read_products` is listed

2. **Verify Environment Variable:**
   - Make sure `SHOPIFY_SCOPES` is set in Vercel
   - Value: `read_products,write_products,read_orders,write_orders`
   - Redeploy if you changed it

3. **Try Again:**
   - Disconnect completely
   - Wait 1 minute
   - Reconnect
   - Make sure to approve ALL permissions when authorizing
