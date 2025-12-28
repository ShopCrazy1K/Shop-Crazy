# How to Enable PayPal in Stripe

## Current Status
PayPal has been temporarily removed from the payment methods because it needs to be activated in your Stripe Dashboard first.

## How to Enable PayPal

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/account/payments/settings
   - Log in to your Stripe account

2. **Enable PayPal**
   - Navigate to "Payment methods" section
   - Find "PayPal" in the list
   - Click to enable it
   - Follow any additional setup steps required by Stripe

3. **Update the Code**
   Once PayPal is enabled in your Stripe Dashboard, update the checkout route:
   
   In `app/api/orders/checkout/route.ts`, change:
   ```typescript
   payment_method_types: ["card"],
   ```
   
   To:
   ```typescript
   payment_method_types: ["card", "paypal"],
   ```

4. **Test**
   - Create a test checkout session
   - Verify PayPal appears as a payment option

## Current Payment Methods (Working Now)

✅ **Credit/Debit Cards** - Always available
✅ **Apple Pay** - Automatically enabled on iOS/macOS Safari
✅ **Google Pay** - Automatically enabled on Chrome (Android/Desktop)

## Notes

- Apple Pay and Google Pay work automatically when "card" is in payment_method_types
- They appear based on the customer's device/browser capabilities
- No additional Stripe Dashboard configuration needed for Apple Pay/Google Pay
- PayPal requires explicit activation in the Stripe Dashboard

