# 🔍 Comprehensive Troubleshooting Guide

## Step 1: Check Database Connection

### Test 1: Debug Database URL
Visit: `https://your-app.vercel.app/api/debug-database-url`

**What to check:**
- ✅ `success: true`
- ✅ `prismaPatternMatch.success: true`
- ✅ `urlInfo.parsed.hostname` matches your Supabase host
- ✅ `urlInfo.parsed.port` is correct (5432 or 6543)

**If it fails:**
- Check `DATABASE_URL` in Vercel environment variables
- Verify password is encoded (`%24` for `$`)
- Make sure no quotes or spaces

### Test 2: Test Prisma Connection
Visit: `https://your-app.vercel.app/api/test-prisma-connection`

**What to check:**
- ✅ All steps show `✅ Success`
- ✅ Step 6 shows query executed successfully

**If it fails:**
- Note which step fails
- Check Vercel logs for detailed error

---

## Step 2: Check Vercel Logs

1. Go to: **Vercel → Deployments → Latest**
2. Click **Functions** tab
3. Click **View Logs**

**Look for:**
- `[Prisma]` messages - Shows database connection attempts
- Error messages - Shows what's failing
- Pattern errors - Shows URL validation issues

**Common errors:**
- `DATABASE_URL environment variable is not set` - Not configured
- `The string did not match the expected pattern` - URL format issue
- `Cannot connect to database server` - Network/authentication issue
- `Authentication failed` - Wrong password

---

## Step 3: Verify Environment Variables

Go to: **Vercel → Settings → Environment Variables**

### Required Variables:

1. **DATABASE_URL** ✅
   - Should be: `postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-1-us-east-2.pooler.supabase.com:6543/postgres`
   - Or: `postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres`
   - Check: No quotes, no spaces, password encoded

2. **STRIPE_SECRET_KEY** (if using payments)
   - Should start with: `sk_test_` or `sk_live_`

3. **STRIPE_PUBLISHABLE_KEY** (if using payments)
   - Should start with: `pk_test_` or `pk_live_`

4. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (if using payments)
   - Same as `STRIPE_PUBLISHABLE_KEY`

5. **STRIPE_WEBHOOK_SECRET** (if using payments)
   - Should start with: `whsec_`

---

## Step 4: Test Specific Features

### Test 1: Create Listing
1. Go to: `/sell`
2. Fill out the form
3. Try to create a listing

**If it fails:**
- Check error message
- Check Vercel logs
- Verify database connection (Step 1)

### Test 2: Sign Up / Login
1. Go to: `/signup` or `/login`
2. Try to create account or login

**If it fails:**
- Check database connection
- Check Vercel logs for Prisma errors

### Test 3: View Products
1. Go to: `/marketplace` or home page
2. Check if products load

**If it fails:**
- Check database connection
- Check if products exist in database

### Test 4: Checkout (if using payments)
1. Add item to cart
2. Go to cart
3. Click checkout

**If it fails:**
- Check Stripe keys are set
- Check database connection (needed to verify user)

---

## Step 5: Common Issues & Fixes

### Issue 1: "DATABASE_URL environment variable is not set"
**Fix:**
- Add `DATABASE_URL` in Vercel environment variables
- Select all environments (Production, Preview, Development)
- Redeploy

### Issue 2: "The string did not match the expected pattern"
**Fix:**
- Check `DATABASE_URL` format in Vercel
- Ensure password is encoded (`%24` for `$`)
- No quotes or spaces
- Try connection pooling URL instead of direct

### Issue 3: "Cannot connect to database server"
**Fix:**
- Verify Supabase database is running
- Check Supabase dashboard for connection issues
- Try direct connection URL (port 5432) instead of pooling
- Check Supabase firewall settings

### Issue 4: "Authentication failed"
**Fix:**
- Verify password is correct
- Check password encoding (`$` → `%24`)
- Try resetting Supabase database password

### Issue 5: Pages show errors or don't load
**Fix:**
- Check Vercel build logs for errors
- Verify all environment variables are set
- Check browser console for frontend errors
- Verify database connection (Step 1)

---

## Step 6: Check Build Status

1. Go to: **Vercel → Deployments**
2. Check latest deployment status

**If build failed:**
- Click on failed deployment
- Check build logs
- Fix errors shown in logs

**If build succeeded but app doesn't work:**
- Check runtime logs (Step 2)
- Verify environment variables (Step 3)
- Test database connection (Step 1)

---

## Step 7: Verify Supabase Database

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu
2. Check **Database** section
3. Verify:
   - Database is active (not paused)
   - Connection pooling is enabled (if using pooling URL)
   - No maintenance mode

---

## Step 8: Get Detailed Error Information

### Method 1: Vercel Logs
1. Go to: **Vercel → Deployments → Latest → Functions**
2. Click **View Logs**
3. Look for error messages
4. Copy the full error message

### Method 2: Browser Console
1. Open your app in browser
2. Press `F12` (or right-click → Inspect)
3. Go to **Console** tab
4. Look for red error messages
5. Copy the errors

### Method 3: Network Tab
1. Open browser DevTools (`F12`)
2. Go to **Network** tab
3. Try the action that's failing
4. Look for failed requests (red)
5. Click on failed request
6. Check **Response** tab for error message

---

## Step 9: Quick Diagnostic Checklist

- [ ] `DATABASE_URL` is set in Vercel
- [ ] `DATABASE_URL` has no quotes or spaces
- [ ] Password is encoded (`%24` for `$`)
- [ ] All environments selected (Production, Preview, Development)
- [ ] App has been redeployed after setting variables
- [ ] `/api/debug-database-url` shows `success: true`
- [ ] `/api/test-prisma-connection` shows all steps passing
- [ ] Vercel build succeeded (no build errors)
- [ ] Supabase database is active
- [ ] No errors in Vercel runtime logs

---

## Step 10: Still Not Working?

If nothing is working after following all steps:

1. **Share these details:**
   - Response from `/api/debug-database-url`
   - Response from `/api/test-prisma-connection`
   - Latest error from Vercel logs
   - Screenshot of Vercel environment variables (hide passwords)
   - What specific action is failing (create listing, login, etc.)

2. **Try these last resorts:**
   - Delete and recreate `DATABASE_URL` in Vercel
   - Try the other connection URL (pooling vs direct)
   - Check Supabase for any service issues
   - Verify your Vercel project is connected to the right GitHub repo

---

## Most Common Fix

**90% of issues are solved by:**
1. Setting `DATABASE_URL` correctly in Vercel
2. Selecting all environments
3. Redeploying the application

**The exact URL to use:**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

Make sure:
- No quotes
- No spaces
- Password encoded (`%24` for `$`)
- All environments selected
- Redeploy after setting

