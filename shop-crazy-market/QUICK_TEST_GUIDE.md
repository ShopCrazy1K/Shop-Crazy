# ⚡ Quick Testing Guide

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Run Automated Security Tests
```bash
# Test checkout security
npm run test:checkout

# Test security headers
npm run test:security-headers

# Run all security tests
npm run test:security
```

### 3. Manual Testing Checklist

#### ✅ Authentication Test (2 minutes)
1. Open browser in **incognito/private mode**
2. Go to `http://localhost:3000/cart`
3. Try to checkout
4. **Expected**: Should redirect to login page

#### ✅ Valid Checkout Test (5 minutes)
1. Log in to your account
2. Add items to cart
3. Go to cart page
4. Click "Checkout"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment
7. **Expected**: Redirects to success page, order created

#### ✅ Error Boundary Test (1 minute)
1. Open browser DevTools Console
2. Add this to test error boundary:
   ```javascript
   throw new Error("Test error");
   ```
3. **Expected**: Error boundary catches it, shows friendly message

#### ✅ Security Headers Test (1 minute)
1. Open any page
2. Open DevTools → Network tab
3. Reload page
4. Click on any request → Headers tab
5. **Expected**: See security headers like `X-Frame-Options`, `X-Content-Type-Options`, etc.

## 🎯 Critical Tests (Must Pass)

- [ ] Cannot checkout without login (401 error)
- [ ] Invalid inputs are rejected (400 errors)
- [ ] Valid checkout completes successfully
- [ ] Security headers are present
- [ ] Error boundary catches errors

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Authentication:
[ ] Unauthenticated checkout blocked
[ ] Invalid user ID rejected
[ ] Valid user checkout works

Validation:
[ ] Empty items rejected
[ ] Invalid prices rejected
[ ] Invalid quantities rejected

Security:
[ ] Security headers present
[ ] Error boundary works
[ ] No console errors

Payment:
[ ] Stripe checkout loads
[ ] Payment succeeds
[ ] Order created
[ ] Success page shows

Notes:
_______________________________________
_______________________________________
```

## 🐛 Common Issues & Fixes

### Issue: "Authentication required" when logged in
**Fix**: Check that `x-user-id` header is being sent from frontend

### Issue: Security headers not showing
**Fix**: Make sure `middleware.ts` is in the root directory

### Issue: Error boundary not catching errors
**Fix**: Verify `ErrorBoundary` is imported and used in `app/layout.tsx`

## ✅ Success Criteria

All tests pass when:
- ✅ Security tests return expected status codes
- ✅ Manual checkout flow completes
- ✅ No console errors
- ✅ Security headers visible in network tab

---

**Time to complete**: ~10 minutes
**Difficulty**: Easy

