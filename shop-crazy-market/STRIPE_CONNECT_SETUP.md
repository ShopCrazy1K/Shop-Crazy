# Stripe Connect Setup Guide

## Enable Stripe Connect for Seller Payouts

To allow sellers to receive payouts, you need to enable Stripe Connect in your Stripe Dashboard.

### Steps to Enable Stripe Connect:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/settings/connect
   - Or navigate: Dashboard → Settings → Connect

2. **Enable Connect**
   - Click "Enable Connect" or "Get Started"
   - Choose "Express accounts" (recommended for marketplaces)
   - Complete the onboarding process

3. **Configure Connect Settings**
   - Set your business information
   - Configure payout schedules
   - Set up your branding (optional)

4. **Test Mode vs Live Mode**
   - Make sure you enable Connect in the same mode (test/live) as your `STRIPE_SECRET_KEY`
   - Test mode: Use test keys for development
   - Live mode: Use live keys for production

### After Enabling Connect:

- Sellers can now add bank accounts for withdrawals
- Payouts will be automatically sent to sellers' bank accounts
- You can manage all connected accounts in the Stripe Dashboard

### Troubleshooting:

**Error: "You can only create new accounts if you've signed up for Connect"**
- Solution: Enable Stripe Connect in your Stripe Dashboard (see steps above)

**Error: "Connect is not available in your country"**
- Solution: Stripe Connect may not be available in all countries. Check Stripe's documentation for supported countries.

**Error: "Invalid API key"**
- Solution: Make sure your `STRIPE_SECRET_KEY` environment variable is set correctly in Vercel

### Resources:

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Connect Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Stripe Dashboard - Connect Settings](https://dashboard.stripe.com/settings/connect)

