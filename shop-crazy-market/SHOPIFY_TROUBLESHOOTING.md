# Shopify Connection Troubleshooting Guide

## Issue: Unable to Connect to Shopify App

If you're seeing "unable to connect" when accessing `https://admin.shopify.com/store/[store-name]/apps/[app-name]`, follow these steps:

## 1. Check Environment Variables

Ensure these environment variables are set in your `.env.local` or deployment environment:

```bash
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important:** 
- `NEXT_PUBLIC_APP_URL` must be your production domain (e.g., `https://your-app.vercel.app`)
- Do NOT include a trailing slash
- Must use `https://` in production

## 2. Verify Redirect URI in Shopify Partners Dashboard

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Navigate to your app
3. Go to **App setup** → **App URL**
4. Set **App URL** to: `https://your-domain.com/api/shopify/app`
5. Go to **App setup** → **Allowed redirection URL(s)**
6. Add this EXACT redirect URI: `https://your-domain.com/api/shopify/oauth/callback`

**Critical:** The redirect URI must match EXACTLY, including:
- Protocol (`https://`)
- Domain (no trailing slash)
- Full path (`/api/shopify/oauth/callback`)

## 3. Test Configuration

Visit the diagnostic endpoint to check your configuration:
```
https://your-domain.com/api/shopify/debug
```

This will show:
- Whether API keys are configured
- Your current redirect URI
- Any configuration issues

## 4. Common Issues

### Issue: "Redirect URI mismatch"
**Solution:** Ensure the redirect URI in Shopify Partners Dashboard matches exactly what's shown in `/api/shopify/debug`

### Issue: "Invalid HMAC"
**Solution:** 
- Verify `SHOPIFY_API_SECRET` is correct
- Ensure the secret matches what's in Shopify Partners Dashboard

### Issue: App not loading in Shopify admin
**Solution:**
- Check that your app is installed on the store
- Verify the App URL in Shopify Partners Dashboard points to `/api/shopify/app`
- Ensure your app is published (if using a custom app, it may need to be installed via OAuth first)

### Issue: "Unable to connect" error
**Solution:**
- Check that your app domain is accessible (not blocked by firewall)
- Verify SSL certificate is valid
- Check browser console for CORS or CSP errors
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

## 5. Installation Flow

1. **From your marketplace:** Sellers go to `/seller/platforms` and click "Connect with Shopify"
2. **OAuth flow:** They're redirected to Shopify to authorize
3. **Callback:** Shopify redirects back to `/api/shopify/oauth/callback`
4. **Connection saved:** The connection is stored in your database

## 6. Direct Access from Shopify Admin

If users access the app directly from Shopify admin:
- They'll be redirected to `/api/shopify/app`
- This route verifies the request and redirects to `/seller/platforms`
- The shop parameter is passed in the URL

## 7. Debugging Steps

1. **Check environment variables:**
   ```bash
   # Run this in your terminal or check your deployment logs
   curl https://your-domain.com/api/shopify/debug
   ```

2. **Check Shopify app settings:**
   - App URL: `https://your-domain.com/api/shopify/app`
   - Redirect URI: `https://your-domain.com/api/shopify/oauth/callback`
   - Scopes: `read_products,write_products,read_orders,write_orders`

3. **Test OAuth flow manually:**
   ```
   https://your-domain.com/api/shopify/oauth?shop=your-store&shopId=your-shop-id
   ```

4. **Check browser console:**
   - Open DevTools → Console
   - Look for CORS, CSP, or network errors

5. **Check server logs:**
   - Look for errors in your deployment logs
   - Check for missing environment variables

## 8. Quick Fixes

### Fix 1: Update Redirect URI
If you changed your domain, update it in:
- Shopify Partners Dashboard
- Environment variable `NEXT_PUBLIC_APP_URL`
- Redeploy your application

### Fix 2: Verify API Credentials
1. Go to Shopify Partners Dashboard
2. Copy the API key and secret
3. Update your environment variables
4. Redeploy

### Fix 3: Clear Cache
- Clear browser cache
- Try in incognito mode
- Clear Shopify admin cache (logout/login)

## Need More Help?

1. Check the diagnostic endpoint: `/api/shopify/debug`
2. Review server logs for specific error messages
3. Verify all environment variables are set correctly
4. Ensure your app is properly configured in Shopify Partners Dashboard
