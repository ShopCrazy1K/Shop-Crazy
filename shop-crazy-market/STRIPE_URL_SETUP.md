# Stripe Website URL Configuration

## What URL Do You Need?

Your website URL is used by Stripe for:
1. **Webhook endpoint** - Where Stripe sends payment events
2. **Checkout redirects** - Where customers return after payment
3. **Stripe Connect** - Where sellers return after onboarding

## For Development (Local Testing)

If you're testing locally, use:
```
http://localhost:3000
```

**Note**: For local webhook testing, you'll need to use Stripe CLI (see below).

## For Production

Use your actual domain with HTTPS:
```
https://yourdomain.com
```

**Examples:**
- `https://shopcrazymarket.com`
- `https://www.shopcrazymarket.com`
- `https://shop-crazy-market.vercel.app` (if using Vercel)

## Where to Use This URL in Stripe

### 1. Set Environment Variable

Add to your `.env` file:
```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 2. Stripe Dashboard - Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select these events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Add it to your `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 3. Stripe Dashboard - Redirect URLs (if using Stripe Connect)

If you're using Stripe Connect for seller payouts:
1. Go to: https://dashboard.stripe.com/settings/applications
2. Add redirect URLs:
   - `https://yourdomain.com/connect/success`
   - `https://yourdomain.com/connect/refresh`

## Testing Webhooks Locally

For local development, use Stripe CLI:

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (shown in terminal, starts with `whsec_`)

5. **Add to `.env`**:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe CLI
   ```

## Quick Setup Checklist

- [ ] Decide on your production domain
- [ ] Set `NEXT_PUBLIC_SITE_URL` in environment variables
- [ ] Add webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook delivery in Stripe Dashboard
- [ ] Verify checkout redirects work correctly

## Current Configuration

Your application uses `NEXT_PUBLIC_SITE_URL` in these places:
- ✅ Checkout success/cancel URLs
- ✅ Stripe Connect onboarding redirects
- ✅ Email notification links
- ✅ Admin dashboard links

## Need Help?

- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **Stripe CLI Docs**: https://stripe.com/docs/stripe-cli
- **Testing Webhooks**: https://stripe.com/docs/webhooks/test

