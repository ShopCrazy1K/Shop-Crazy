# Marketplace Debugging Guide

## Issue: Marketplace showing "No products found"

### Root Cause
Listings are created with `isActive: false` by default and only become active after:
1. Stripe subscription payment is completed
2. Webhook activates the listing
3. Manual activation via `/api/listings/[id]/activate`

### How to Debug

1. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[MARKETPLACE]` logs
   - Check for API errors

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Reload marketplace page
   - Find the `/api/listings` request
   - Check:
     - Status code (should be 200)
     - Response body (should be an array)
     - Request URL (check query parameters)

3. **Check Server Logs**
   - Look for `[API LISTINGS]` logs
   - Check how many listings are found
   - Check filtering results

### Common Issues

#### Issue 1: All Listings Are Inactive
**Symptom:** API returns empty array
**Solution:** 
- Check if listings have been activated
- Verify Stripe webhook is working
- Manually activate a listing for testing

#### Issue 2: API Returns Error
**Symptom:** Console shows error, status code not 200
**Solution:**
- Check database connection
- Verify Prisma schema matches database
- Check for missing columns

#### Issue 3: Listings Filtered Out
**Symptom:** API returns listings but marketplace shows none
**Solution:**
- Check if `excludeUserId` is filtering out all listings
- Verify `isActive` filter is working
- Check category/type filters

### Quick Test

To test if marketplace works, temporarily modify the API to show inactive listings:

```typescript
// In /app/api/listings/route.ts
// Temporarily change:
where.isActive = true;
// To:
where.isActive = undefined; // Show all
```

### Activation Process

1. User creates listing → `isActive: false`
2. User pays Stripe subscription fee
3. Stripe webhook receives payment
4. Webhook calls activation endpoint
5. Listing becomes `isActive: true`
6. Listing appears in marketplace

### Check Activation Status

Query to check listing status:
```sql
SELECT id, title, "isActive", "feeCustomerId" 
FROM "Listing" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

