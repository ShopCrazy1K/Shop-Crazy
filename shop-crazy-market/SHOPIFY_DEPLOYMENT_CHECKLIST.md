# 🚀 Shopify Integration Deployment Checklist

## ✅ Code Deployed
Your Shopify integration code has been pushed to GitHub and should trigger a Vercel deployment automatically.

## 🔧 Required Vercel Environment Variables

You **MUST** add these environment variables in Vercel for the Shopify integration to work:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project (likely "shop-crazy-market" or "press-go")

### 2. Add Environment Variables
Go to: **Settings** → **Environment Variables**

Add these variables:

```
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
SHOPIFY_APP_URL=https://your-app.vercel.app
```

**Important:**
- ✅ Set for **Production**, **Preview**, and **Development** environments
- ✅ Make sure `NEXT_PUBLIC_APP_URL` is set (required for redirect URIs)

### 3. Redeploy After Adding Variables
After adding environment variables:
1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2-3 minutes)

## 🔍 Verify Deployment

### 1. Check Deployment Status
- Go to: https://vercel.com/dashboard
- Check **Deployments** tab
- Latest deployment should show "Ready" status

### 2. Test Diagnostic Endpoint
After deployment, visit:
```
https://press-go.vercel.app/api/shopify/debug
```

This will show:
- ✅ API keys configured
- ✅ Current redirect URI
- ✅ Any configuration issues

### 3. Verify Shopify Configuration
Make sure in Shopify Partners Dashboard:
- **App URL**: `https://press-go.vercel.app/api/shopify/app`
- **Redirect URI**: `https://press-go.vercel.app/api/shopify/auth/callback`

## 🧪 Test the Integration

1. **Visit your app**: https://press-go.vercel.app/seller/platforms
2. **Click "Connect with Shopify"**
3. **Enter store name**: `press-go-transfers` (or your store name)
4. **Complete OAuth flow**

## 📋 Quick Checklist

- [ ] Environment variables added to Vercel
- [ ] Deployment completed successfully
- [ ] Diagnostic endpoint shows correct configuration
- [ ] Shopify Partners Dashboard URLs configured
- [ ] Test OAuth connection works

## 🆘 Troubleshooting

### Deployment Failed?
1. Check **Build Logs** in Vercel
2. Verify all environment variables are set
3. Check for any TypeScript/build errors

### OAuth Not Working?
1. Visit `/api/shopify/debug` to check configuration
2. Verify redirect URI matches exactly in Shopify
3. Check browser console for errors
4. Review server logs in Vercel

### Still Having Issues?
- Check `SHOPIFY_TROUBLESHOOTING.md` for detailed guide
- Verify all environment variables are set correctly
- Ensure Shopify app is properly configured in Partners Dashboard
