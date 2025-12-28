# PayPal Payment Method - Availability & Setup

## ⚠️ Important: Regional Availability

**PayPal via Stripe is only available in:**
- 🇪🇺 European Economic Area (EEA) - excluding Hungary
- 🇬🇧 United Kingdom
- 🇨🇭 Switzerland

**If your Stripe account is registered in the US, Canada, or other countries, PayPal will NOT be available through Stripe.**

## Current Status
PayPal has been removed from the payment methods because:
1. It's not available in all regions (see above)
2. It needs to be activated in your Stripe Dashboard (if you're in a supported region)

## How to Enable PayPal (If Available in Your Region)

1. **Check Your Account Location**
   - Go to: https://dashboard.stripe.com/settings/account
   - Check your account's registered country
   - If you're in EEA, UK, or Switzerland, proceed to step 2

2. **Go to Payment Methods Settings**
   - Visit: https://dashboard.stripe.com/settings/payment_methods
   - Log in to your Stripe account

3. **Enable PayPal**
   - Scroll to the "Wallets" section
   - Look for "PayPal" in the list
   - If you see it, click "Turn on"
   - Choose your settlement preference:
     - **Settle PayPal revenue to Stripe balance**: Funds go to your Stripe balance
     - **Send revenue from PayPal sales to PayPal**: Funds stay in your PayPal account
   - Click "Continue to PayPal" to connect your PayPal Business account
   - Complete the PayPal connection process

4. **Update the Code**
   Once PayPal is enabled in your Stripe Dashboard, update the checkout route:
   
   In `app/api/orders/checkout/route.ts`, change:
   ```typescript
   payment_method_types: ["card"],
   ```
   
   To:
   ```typescript
   payment_method_types: ["card", "paypal"],
   ```

5. **Test**
   - Create a test checkout session
   - Verify PayPal appears as a payment option

## Current Payment Methods (Working Now)

✅ **Credit/Debit Cards** - Always available
✅ **Apple Pay** - Automatically enabled on iOS/macOS Safari
✅ **Google Pay** - Automatically enabled on Chrome (Android/Desktop)

## Alternative: Direct PayPal Integration

If PayPal is not available through Stripe in your region, you can integrate PayPal directly using:
- PayPal JavaScript SDK
- PayPal REST API
- Third-party services that connect PayPal with Stripe

However, this would require a separate integration outside of Stripe Checkout.

## Notes

- Apple Pay and Google Pay work automatically when "card" is in payment_method_types
- They appear based on the customer's device/browser capabilities
- No additional Stripe Dashboard configuration needed for Apple Pay/Google Pay
- PayPal requires explicit activation in the Stripe Dashboard AND regional availability

