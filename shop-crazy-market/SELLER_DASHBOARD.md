# 👤 Seller Dashboard Documentation

## Overview

The seller dashboard allows shop owners to:
- View fee breakdown and revenue
- Toggle advertising opt-in/opt-out
- Track listing fees
- Monitor recent transactions

## Features

### 1. Fee Summary
- Total revenue (gross sales)
- Total fees (all fees combined)
- Net payout (revenue - fees)
- Monthly breakdown

### 2. Fee Breakdown
- Listing fees ($0.20/product/month)
- Transaction fees (5%)
- Payment processing fees (2% + $0.20)
- Advertising fees (15%, if enabled)

### 3. Advertising Toggle
- Easy toggle switch to enable/disable
- Shows current status
- Explains fee structure

### 4. Recent Fees
- List of recent fee transactions
- Shows type, amount, and date
- Links to orders when applicable

## API Endpoints

### Get Fee Summary
```
GET /api/seller/fees?shopId={shopId}&month={month}&year={year}
```

Returns:
- Total revenue
- Fee breakdown by type
- Net payout

### Get Recent Fees
```
GET /api/seller/fees/recent?shopId={shopId}&limit={limit}
```

Returns:
- List of recent fee transactions
- Sorted by date (newest first)

### Toggle Advertising
```
PUT /api/shops/{shopId}/advertising
Body: { "enabled": true/false }
```

Returns:
- Updated shop with advertising status

## Access

The seller dashboard is accessible at `/seller/dashboard`.

**TODO**: Add authentication to ensure only shop owners can access their dashboard.

## Future Enhancements

1. **Fee History**: View fees by month/year
2. **Export**: Download fee reports as CSV
3. **Notifications**: Email alerts for fee charges
4. **Payment Methods**: Manage payment methods for listing fees
5. **Analytics**: Charts showing fee trends

