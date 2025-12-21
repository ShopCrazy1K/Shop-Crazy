# 💰 Fee Structure Documentation

## Overview

Shop Crazy Market uses a comprehensive fee structure similar to Etsy:

1. **Listing Fee**: $0.20 per product per month
2. **Transaction Fee**: 5% of total sale (item + shipping + gift wrap)
3. **Payment Processing Fee**: ~2% + $0.20 (varies by country)
4. **Advertising Fee**: 15% (optional, for sellers who opt-in)

## Fee Breakdown

### 1. Listing Fees ($0.20/month per product)

- **Amount**: $0.20 per active product per month
- **When**: Charged monthly on the 1st
- **Who pays**: Seller
- **Billing**: Automatic via Stripe

**Example**:
- Shop with 10 products = $2.00/month
- Shop with 50 products = $10.00/month

### 2. Transaction Fees (5%)

- **Amount**: 5% of total sale amount
- **Includes**: Item price + shipping + gift wrap
- **When**: Charged per transaction
- **Who pays**: Seller (deducted from payout)

**Example**:
- Sale: $100 item + $10 shipping + $5 gift wrap = $115 total
- Transaction fee: $115 × 5% = $5.75

### 3. Payment Processing Fees

- **US**: 2% + $0.20 per transaction
- **Canada**: 2.5% + $0.30
- **UK**: 2% + £0.25
- **Australia**: 2.2% + $0.30
- **EU**: 2.1% + €0.25
- **Default**: 2% + $0.20

**Example (US)**:
- Sale: $115 total
- Payment processing: ($115 × 2%) + $0.20 = $2.50

### 4. Advertising Fees (15% - Optional)

- **Amount**: 15% of total sale
- **When**: Only for sellers who opt-in
- **Who pays**: Seller (deducted from payout)
- **Benefit**: Enhanced product visibility

**Example**:
- Sale: $115 total
- Advertising fee: $115 × 15% = $17.25

## Complete Fee Example

**Sale Details**:
- Item: $100
- Shipping: $10
- Gift Wrap: $5
- **Subtotal**: $115

**Fees**:
- Transaction Fee (5%): $5.75
- Payment Processing (2% + $0.20): $2.50
- Advertising Fee (15%, if opted-in): $17.25
- **Total Fees**: $25.50 (with advertising) or $8.25 (without)

**Seller Payout**:
- With advertising: $115 - $25.50 = **$89.50**
- Without advertising: $115 - $8.25 = **$106.75**

## Implementation

### Fee Calculation

```typescript
import { calculateFees } from "@/lib/fees";

const feeBreakdown = calculateFees({
  itemTotal: 10000, // $100 in cents
  shippingTotal: 1000, // $10 in cents
  giftWrapTotal: 500, // $5 in cents
  country: "US",
  hasAdvertising: true,
});

// Returns:
// {
//   subtotal: 11500,
//   transactionFee: 575,
//   paymentProcessingFee: 250,
//   advertisingFee: 1725,
//   totalFees: 2550,
//   sellerPayout: 8950,
//   platformRevenue: 2550
// }
```

### Monthly Listing Fee Billing

Run monthly via cron job or scheduled task:

```bash
POST /api/listing-fees/bill
```

This will:
1. Find all shops with active products
2. Calculate listing fees ($0.20 × product count)
3. Create ListingFee records
4. Charge shops via Stripe (TODO: implement)

### Seller Payouts

After order completion, fees are automatically deducted:

```bash
POST /api/connect/transfer
{
  "orderId": "order_123"
}
```

The system:
1. Retrieves order with fee breakdown
2. Calculates per-shop fees
3. Transfers seller payout (subtotal - fees) to seller's Stripe Connect account

## Admin Dashboard

View fee analytics at `/admin/fees`:

- Total revenue by fee type
- Fee breakdown by shop
- Period selection (this month, last month, this year)
- Fee structure documentation

## Database Schema Updates

See `prisma/schema-updates.md` for required schema changes:

- Add `hasAdvertising` to Shop model
- Add `stripeAccountId` to Shop model
- Add `metadata` JSON field to Order model
- Create `ListingFee` model
- Create `FeeTransaction` model

## Configuration

Fee rates are configurable in `lib/fees.ts`:

```typescript
export const LISTING_FEE_PER_MONTH = 20; // $0.20 in cents
export const TRANSACTION_FEE_PERCENTAGE = 0.05; // 5%
export const ADVERTISING_FEE_PERCENTAGE = 0.15; // 15%
```

Payment processing fees by country are also configurable in the same file.

## Testing

### Test Fee Calculation

```typescript
const fees = calculateFees({
  itemTotal: 10000,
  shippingTotal: 1000,
  country: "US",
  hasAdvertising: false,
});

console.log("Seller receives:", fees.sellerPayout / 100); // $106.75
console.log("Platform revenue:", fees.platformRevenue / 100); // $8.25
```

### Test Monthly Billing

```bash
curl -X POST http://localhost:3000/api/listing-fees/bill
```

## Production Considerations

1. **Listing Fee Billing**: Set up cron job to run on 1st of each month
2. **Failed Payments**: Handle failed listing fee charges
3. **Refunds**: Adjust fees when orders are refunded
4. **Reporting**: Generate monthly fee reports for accounting
5. **Tax Compliance**: Ensure fee structure complies with local tax laws

