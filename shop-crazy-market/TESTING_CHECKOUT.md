# 🧪 Checkout Flow Testing Guide

## Overview
This guide tests the checkout flow with the new security improvements:
- Authentication requirement
- Input validation
- Error handling
- Security headers

## Prerequisites

1. **Environment Setup**
   ```bash
   # Make sure you have .env file configured
   cp .env.example .env
   # Fill in your Stripe test keys
   ```

2. **Test Stripe Keys**
   - Use Stripe test mode keys (start with `sk_test_` and `pk_test_`)
   - Get test card numbers from: https://stripe.com/docs/testing

3. **Test Data**
   - Create a test user account
   - Add some products to the marketplace
   - Have products in your cart

## Test Cases

### ✅ Test 1: Authenticated Checkout (Happy Path)

**Steps:**
1. Log in to your account
2. Add items to cart
3. Go to cart page (`/cart`)
4. Click "Checkout" button
5. Complete Stripe checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
6. Verify redirect to success page
7. Check order appears in order history

**Expected Results:**
- ✅ Checkout button works
- ✅ Redirects to Stripe checkout
- ✅ Payment succeeds
- ✅ Redirects to success page
- ✅ Order created in database
- ✅ Cart is cleared
- ✅ Order visible in `/orders` page

**Check:**
- [ ] No console errors
- [ ] Network requests succeed (200 status)
- [ ] Order ID is valid UUID
- [ ] Fees calculated correctly

---

### 🔒 Test 2: Unauthenticated Checkout (Security Test)

**Steps:**
1. **Log out** (or use incognito/private window)
2. Add items to cart (if possible without auth)
3. Try to checkout
4. OR: Try to call checkout API directly without auth header

**Expected Results:**
- ✅ Redirects to login page (if trying from UI)
- ✅ API returns 401 error if called directly
- ✅ Error message: "Authentication required. Please log in to checkout."
- ✅ No checkout session created
- ✅ No order created

**Check:**
- [ ] API returns status 401
- [ ] Error message is clear and helpful
- [ ] No Stripe session created
- [ ] No database records created

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items": [{"name": "Test", "price": 1000, "quantity": 1}]}'
# Should return 401
```

---

### ✅ Test 3: Invalid User ID (Security Test)

**Steps:**
1. Log in
2. Open browser DevTools → Network tab
3. Try checkout with invalid user ID in header
4. OR: Modify the `x-user-id` header to invalid UUID

**Expected Results:**
- ✅ API returns 401 error
- ✅ Error message: "Invalid user. Please log in again."
- ✅ No checkout session created

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: invalid-user-id" \
  -d '{"items": [{"name": "Test", "price": 1000, "quantity": 1}]}'
# Should return 401
```

---

### ✅ Test 4: Input Validation

#### 4a. Empty Items Array

**Steps:**
1. Log in
2. Call checkout API with empty items array

**Expected Results:**
- ✅ API returns 400 error
- ✅ Error message about invalid items

**Test:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"items": []}'
# Should return 400
```

#### 4b. Invalid Price

**Steps:**
1. Log in
2. Call checkout with negative price or very high price (>$10,000)

**Expected Results:**
- ✅ API returns 400 error
- ✅ Error message about invalid price

**Test:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"items": [{"name": "Test", "price": -100, "quantity": 1}]}'
# Should return 400
```

#### 4c. Invalid Quantity

**Steps:**
1. Log in
2. Call checkout with zero or negative quantity

**Expected Results:**
- ✅ API returns 400 error
- ✅ Error message about invalid quantity

**Test:**
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"items": [{"name": "Test", "price": 1000, "quantity": 0}]}'
# Should return 400
```

#### 4d. Invalid Shipping Total

**Steps:**
1. Log in
2. Call checkout with negative shipping total

**Expected Results:**
- ✅ API returns 400 error
- ✅ Error message about invalid shipping total

---

### ✅ Test 5: Error Boundary

**Steps:**
1. Log in
2. Add items to cart
3. Simulate an error (e.g., disconnect network, invalid API response)
4. Try to checkout

**Expected Results:**
- ✅ Error boundary catches the error
- ✅ User sees friendly error message
- ✅ App doesn't crash
- ✅ "Go Home" button works

---

### ✅ Test 6: Security Headers

**Steps:**
1. Open any page in browser
2. Open DevTools → Network tab
3. Reload page
4. Check response headers

**Expected Results:**
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security` header present
- ✅ `Content-Security-Policy` header present

**Check:**
```bash
curl -I http://localhost:3000/ | grep -i "x-frame\|x-content\|xss\|strict\|content-security"
```

---

### ✅ Test 7: Complete Purchase Flow

**Steps:**
1. Log in
2. Browse marketplace
3. Add multiple items to cart
4. Go to cart, verify totals
5. Click checkout
6. Complete Stripe payment
7. Verify success page shows order details
8. Check order history
9. Verify digital products have download links (if applicable)

**Expected Results:**
- ✅ All steps complete without errors
- ✅ Order totals match cart totals
- ✅ Fees calculated correctly
- ✅ Order saved to database
- ✅ Success page shows correct order info

---

### ✅ Test 8: Multiple Concurrent Checkouts

**Steps:**
1. Log in
2. Open multiple tabs
3. Try to checkout from different tabs simultaneously

**Expected Results:**
- ✅ Each checkout creates separate session
- ✅ No conflicts or errors
- ✅ All orders processed correctly

---

## Manual Testing Checklist

### Authentication & Security
- [ ] Cannot checkout without logging in
- [ ] Invalid user ID is rejected
- [ ] Valid user ID works correctly
- [ ] Security headers are present

### Input Validation
- [ ] Empty items array rejected
- [ ] Invalid prices rejected
- [ ] Invalid quantities rejected
- [ ] Negative shipping rejected
- [ ] Valid inputs accepted

### Error Handling
- [ ] Network errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Error boundary catches React errors
- [ ] App doesn't crash on errors

### Payment Flow
- [ ] Stripe checkout loads correctly
- [ ] Test cards work
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] Order created in database
- [ ] Cart cleared after purchase

### Order Management
- [ ] Order appears in order history
- [ ] Order details are correct
- [ ] Digital products have download links
- [ ] Physical products show shipping info

---

## Automated Testing (Future)

For production, consider adding:

1. **Unit Tests** (Jest/Vitest)
   - Validation functions
   - Fee calculations
   - Error handling

2. **Integration Tests** (Playwright/Cypress)
   - Complete checkout flow
   - Authentication flow
   - Error scenarios

3. **API Tests** (Supertest)
   - Checkout endpoint
   - Authentication checks
   - Input validation

---

## Test Data

### Stripe Test Cards

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Requires Authentication:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

More test cards: https://stripe.com/docs/testing

---

## Troubleshooting

### Issue: 401 Error on Valid User
- Check user exists in database
- Verify `x-user-id` header is being sent
- Check user ID format (should be UUID)

### Issue: Validation Errors
- Check input format matches expected structure
- Verify prices are in cents (integers)
- Ensure quantities are positive integers

### Issue: Stripe Errors
- Verify Stripe keys are set correctly
- Check Stripe dashboard for errors
- Ensure webhook endpoint is configured

### Issue: Order Not Created
- Check webhook is receiving events
- Verify database connection
- Check server logs for errors

---

## Success Criteria

✅ All security tests pass
✅ All validation tests pass
✅ Payment flow completes successfully
✅ Orders are created correctly
✅ Error handling works as expected
✅ Security headers are present

---

**Last Updated**: Today
**Status**: Ready for Testing ✅

