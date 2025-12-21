# ⏰ Monthly Listing Fee Billing - Cron Setup

## Overview

The monthly listing fee billing system charges shops $0.20 per active product each month.

## Setup Options

### Option 1: Cron Job (Linux/Mac)

Add to your crontab (`crontab -e`):

```bash
# Run on the 1st of each month at 2:00 AM
0 2 1 * * cd /path/to/shop-crazy-market && npm run bill-listing-fees >> /var/log/listing-fees.log 2>&1
```

### Option 2: Vercel Cron (Recommended for Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/listing-fees/bill",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

Then create `app/api/listing-fees/bill/route.ts` (already created) that can be called by Vercel.

### Option 3: GitHub Actions

Create `.github/workflows/monthly-billing.yml`:

```yaml
name: Monthly Listing Fee Billing

on:
  schedule:
    - cron: '0 2 1 * *'  # 1st of each month at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  bill:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run bill-listing-fees
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

### Option 4: Node-Cron (Development)

For local development, you can use node-cron:

```typescript
import cron from "node-cron";
import billListingFees from "./scripts/bill-listing-fees";

// Run on 1st of each month at 2 AM
cron.schedule("0 2 1 * *", () => {
  console.log("Running monthly listing fee billing...");
  billListingFees();
});
```

## Testing

Test the billing script manually:

```bash
npm run bill-listing-fees
```

Or call the API endpoint:

```bash
curl -X POST http://localhost:3000/api/listing-fees/bill
```

## Monitoring

- Check logs for successful billing
- Monitor failed payments
- Track shops without Stripe accounts
- Review fee transaction records in database

## Troubleshooting

1. **Script fails**: Check database connection and Stripe keys
2. **Shops not charged**: Verify Stripe Connect accounts are set up
3. **Duplicate billing**: Script checks for existing fees before billing
4. **Missing products**: Only active products (quantity > 0) are billed

