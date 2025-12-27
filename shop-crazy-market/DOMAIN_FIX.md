# 🔧 Domain Fix for shopcrazymarket.com

## Issue
The domain https://shopcrazymarket.com/ is not working correctly due to inconsistent environment variable usage.

## ✅ Fixed
- Updated all API routes to use `NEXT_PUBLIC_SITE_URL` consistently
- Added fallback to `https://shopcrazymarket.com` for all routes
- Removed localhost fallbacks from production code

## 🚀 Required Steps in Vercel

### 1. Set Environment Variable
1. Go to your Vercel project: https://vercel.com/dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update:
   - **Key:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://shopcrazymarket.com`
   - **Environment:** Production, Preview, Development (all)
4. Click **Save**

### 2. Verify Domain Configuration
1. Go to **Settings** → **Domains**
2. Verify `shopcrazymarket.com` is listed and configured
3. Check DNS records are correct:
   - A record pointing to Vercel's IP
   - CNAME record if using www subdomain
4. Ensure SSL certificate is active (should be automatic)

### 3. Redeploy
After setting the environment variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger redeploy

### 4. Verify Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Update webhook endpoint URL to:
   ```
   https://shopcrazymarket.com/api/stripe/webhook
   ```
3. Also update:
   ```
   https://shopcrazymarket.com/api/webhooks/stripe
   ```
   (if you have both)

## 🔍 Troubleshooting

### Domain not resolving
- Check DNS records at your domain registrar
- Verify domain is added in Vercel Settings → Domains
- Wait 24-48 hours for DNS propagation

### SSL certificate issues
- Vercel automatically provisions SSL certificates
- May take a few minutes after domain is added
- Check SSL status in Vercel Settings → Domains

### Environment variable not working
- Ensure `NEXT_PUBLIC_SITE_URL` is set in **all environments**
- Redeploy after adding the variable
- Check deployment logs for errors

### 404 errors
- Verify the domain is properly connected in Vercel
- Check that the latest deployment is active
- Clear browser cache and try again

## 📝 Updated Routes
All these routes now use `NEXT_PUBLIC_SITE_URL`:
- `/api/orders/checkout` - Order checkout success/cancel URLs
- `/api/listings/create` - Listing fee payment URLs
- `/api/listings/checkout` - Listing checkout URLs
- `/api/checkout` - General checkout URLs
- `/api/connect/onboard` - Stripe Connect onboarding URLs

## ✅ Checklist
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://shopcrazymarket.com` in Vercel
- [ ] Domain verified in Vercel Settings → Domains
- [ ] SSL certificate active
- [ ] Latest deployment redeployed
- [ ] Stripe webhook URLs updated
- [ ] Tested checkout flow end-to-end

