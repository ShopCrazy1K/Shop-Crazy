# Shopify "Refused to Connect" Error - Troubleshooting

## Current Issue
Shopify admin dashboard shows: "shopcrazymarket.com refused to connect"

## What We've Fixed
1. ✅ Changed route to return HTML instead of HTTP redirect
2. ✅ Removed deprecated `X-Frame-Options: ALLOW-FROM` header
3. ✅ Added proper `Content-Security-Policy: frame-ancestors` header
4. ✅ Added JavaScript redirect that works in iframes

## Possible Remaining Issues

### 1. Check Shopify App URL Configuration

In Shopify Partners Dashboard:
1. Go to your app
2. **App setup** → **App URL**
3. Must be EXACTLY: `https://shopcrazymarket.com/api/shopify/app`
4. **Save** if changed

### 2. Verify Route is Accessible

Test the route directly:
```bash
curl https://shopcrazymarket.com/api/shopify/app?shop=your-store.myshopify.com
```

Should return HTML, not an error.

### 3. Check Browser Console

When you see the error in Shopify:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any JavaScript errors
4. Go to **Network** tab
5. Find the request to `/api/shopify/app`
6. Check the response status and headers

### 4. Check for CORS Issues

The route should allow:
- `Content-Security-Policy: frame-ancestors https://admin.shopify.com https://*.myshopify.com`

### 5. Verify Deployment

1. Check Vercel dashboard - is the latest deployment successful?
2. Wait 2-3 minutes after pushing changes
3. Hard refresh the Shopify admin page (Ctrl+Shift+R or Cmd+Shift+R)

### 6. Alternative: Use App Bridge (If Still Not Working)

If the iframe approach doesn't work, you might need to:
1. Install Shopify App Bridge
2. Use App Bridge for navigation instead of iframe embedding
3. This requires more setup but is the recommended approach for modern Shopify apps

## Quick Test

1. Open this URL directly in a new tab:
   ```
   https://shopcrazymarket.com/api/shopify/app?shop=your-store.myshopify.com
   ```
2. You should see a page that says "Redirecting to platform management..."
3. If you see an error, that's the problem

## If Still Not Working

Share:
1. The exact error message from browser console
2. The Network tab response for the `/api/shopify/app` request
3. What you see when visiting the URL directly
