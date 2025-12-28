# How to Check if Payment is in Stripe

If a customer paid but you don't see the money in Stripe, follow these steps:

## Step 1: Verify Payment Status

Use the payment verification API:

```
GET /api/orders/[orderId]/verify-payment?userId=YOUR_USER_ID
```

This will show you:
- Order status in database
- Stripe session details
- Payment intent details
- Whether payment was actually captured
- Test vs Live mode

## Step 2: Check Stripe Dashboard

### Check Test Mode vs Live Mode

1. **Test Mode:** Go to https://dashboard.stripe.com/test/payments
2. **Live Mode:** Go to https://dashboard.stripe.com/payments

**Important:** Make sure you're checking the correct mode!
- If your `STRIPE_SECRET_KEY` starts with `sk_test_`, check **Test Mode**
- If it starts with `sk_live_`, check **Live Mode**

### Search for Payment

1. Go to Stripe Dashboard → Payments
2. Search by:
   - **Session ID:** Use the `stripeSessionId` from the order
   - **Payment Intent ID:** Use the `stripePaymentIntent` from the order
   - **Customer Email:** The buyer's email
   - **Amount:** The order total

## Step 3: Check Webhook Events

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check the "Events" tab
4. Look for `checkout.session.completed` events
5. Check if the event was successful or had errors

## Step 4: Common Issues

### Issue 1: Payment in Test Mode, Looking in Live Mode
**Solution:** Check the test mode dashboard: https://dashboard.stripe.com/test/payments

### Issue 2: Webhook Not Firing
**Solution:** 
- Verify webhook is configured in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Check Vercel function logs for webhook errors

### Issue 3: Payment Intent Not Created
**Solution:**
- Check if checkout session was created successfully
- Verify customer completed payment
- Check if payment was canceled

### Issue 4: Payment Pending
**Solution:**
- Some payment methods take time to process
- Check payment intent status in Stripe
- Wait a few minutes and check again

## Step 5: Get Order Details

To get the Stripe session ID and payment intent ID for an order:

1. Go to your order detail page: `/orders/[orderId]`
2. Or use the API: `/api/orders/[orderId]?userId=YOUR_USER_ID`
3. Look for:
   - `stripeSessionId` - Use this to search in Stripe
   - `stripePaymentIntent` - Use this to find the payment

## Quick Verification Script

You can also use this in your terminal:

```bash
# Get order details
curl "https://shopcrazymarket.com/api/orders/[ORDER_ID]/verify-payment?userId=[USER_ID]"
```

This will return detailed payment information including Stripe session and payment intent details.

## Still Can't Find It?

1. Check Vercel function logs for `/api/orders/checkout` and `/api/webhooks/stripe`
2. Verify the order was actually created
3. Check if customer completed the Stripe checkout (they might have canceled)
4. Verify you're using the correct Stripe account

