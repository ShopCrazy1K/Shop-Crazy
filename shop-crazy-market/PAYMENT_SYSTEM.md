# 💳 Payment System Documentation

## Overview

Complete Stripe payment integration with webhooks, seller payouts, refunds, disputes, taxes, and shipping.

## Features

### 1. Stripe Webhooks + Order Creation

**File**: `app/api/webhooks/stripe/route.ts`

- Handles Stripe webhook events securely with signature verification
- Automatically creates orders in database when checkout completes
- Processes refunds and disputes
- Links Stripe payment intents to orders for refund tracking

**Events Handled**:
- `checkout.session.completed` - Creates order in database
- `payment_intent.succeeded` - Logs successful payment
- `charge.refunded` - Handles refunds
- `charge.dispute.created` - Tracks disputes

**Setup**:
1. Create webhook endpoint in Stripe Dashboard
2. Set webhook URL to: `https://yourdomain.com/api/webhooks/stripe`
3. Add `STRIPE_WEBHOOK_SECRET` to environment variables
4. Select events: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`

### 2. Seller Payouts (Stripe Connect)

**Files**:
- `app/api/connect/onboard/route.ts` - Seller onboarding
- `app/api/connect/transfer/route.ts` - Transfer funds to sellers

**Features**:
- Stripe Connect Express accounts for sellers
- Automatic onboarding flow
- Platform fee calculation (10%)
- Transfer funds to sellers after order completion

**Flow**:
1. Seller creates shop → calls `/api/connect/onboard`
2. Redirects to Stripe onboarding
3. After order completion → call `/api/connect/transfer`
4. Funds transferred minus platform fee

**Platform Fee**: 10% of order total

### 3. Refunds & Disputes Dashboard

**File**: `app/admin/refunds/page.tsx`

**Features**:
- View all refunds and disputes
- Process refunds
- Handle disputes (accept/contest)
- Status tracking

**API**: `app/api/refunds/route.ts`
- POST - Create refund
- GET - List refunds

### 4. Taxes + Shipping Rates

**Files**:
- `lib/taxes.ts` - Tax calculation
- `lib/shipping.ts` - Shipping rate calculation
- `app/api/calculate-total/route.ts` - Calculate order total

**Tax Calculation**:
- State-based tax rates
- Configurable per state
- Default 6% if state not found

**Shipping Options**:
- Standard Shipping ($5.99, 5 days)
- Express Shipping ($12.99, 2 days)
- Overnight ($24.99, 1 day)
- Weight-based pricing

**Usage**:
```typescript
POST /api/calculate-total
{
  "items": [{ "price": 12900, "quantity": 1 }],
  "shippingZip": "90210",
  "shippingState": "CA",
  "weight": 2
}
```

### 5. Launch Checklist

**File**: `LAUNCH_CHECKLIST.md`

Comprehensive checklist covering:
- Environment setup
- Security configuration
- Database setup
- Stripe configuration
- Testing requirements
- Monitoring setup
- Legal compliance
- Post-launch monitoring

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
```

## API Endpoints

### Payment
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Connect (Seller Payouts)
- `POST /api/connect/onboard` - Create Connect account
- `POST /api/connect/transfer` - Transfer funds to seller

### Refunds
- `POST /api/refunds` - Create refund
- `GET /api/refunds` - List refunds

### Calculations
- `POST /api/calculate-total` - Calculate order total with tax/shipping

## Database Schema Updates Needed

Consider adding to `Order` model:
```prisma
model Order {
  // ... existing fields
  paymentIntentId String?  // Store for refunds
  stripeSessionId String?  // Store checkout session ID
}
```

Consider adding to `Shop` model:
```prisma
model Shop {
  // ... existing fields
  stripeAccountId String?  // Stripe Connect account ID
}
```

## Testing

### Test Webhook Locally

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Trigger test events: `stripe trigger checkout.session.completed`

### Test Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **Idempotency**: Handle duplicate webhook events
3. **Error Handling**: Log all errors, don't expose sensitive data
4. **Rate Limiting**: Implement rate limiting on API routes
5. **Input Validation**: Validate all inputs before processing

## Production Checklist

- [ ] Switch to production Stripe keys
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Test webhook signature verification
- [ ] Set up error monitoring (Sentry)
- [ ] Configure payout schedules
- [ ] Test refund flow end-to-end
- [ ] Test dispute handling
- [ ] Set up tax calculation (consider TaxJar/Avalara)
- [ ] Integrate real shipping APIs (USPS, FedEx)
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

## Support

For Stripe-specific issues:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

