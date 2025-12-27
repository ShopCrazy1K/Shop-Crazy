# 🔧 Fix: "The string did not match the expected pattern" Error

## Problem
Prisma is very strict about the `DATABASE_URL` format. This error occurs when:
- URL has query parameters (e.g., `?pgbouncer=true&sslmode=require`)
- URL has hash fragments (e.g., `#something`)
- Password contains unencoded special characters (`$`, `#`, `@`, etc.)
- URL has extra whitespace or quotes
- URL uses `postgres://` instead of `postgresql://`

## ✅ Fix Applied
Enhanced `next.config.js` to automatically clean `DATABASE_URL`:
1. ✅ Removes query parameters and hash fragments
2. ✅ Removes surrounding quotes and whitespace
3. ✅ Converts `postgres://` to `postgresql://`
4. ✅ Encodes special characters in password

## 🚀 Verify Your DATABASE_URL in Vercel

### Step 1: Check Current DATABASE_URL
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. **Important:** The URL should NOT have:
   - Query parameters: `?pgbouncer=true&sslmode=require`
   - Hash fragments: `#something`
   - Surrounding quotes: `"postgresql://..."`
   - Extra spaces

### Step 2: Correct Format
Your `DATABASE_URL` should look like:
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**NOT:**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### Step 3: If Using Transaction Pooler
For Supabase transaction pooler (port 6543), use:
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Remove any query parameters** like `?pgbouncer=true&sslmode=require`

### Step 4: If Password Has Special Characters
If your password contains `$`, `#`, `@`, etc., they should be URL-encoded:
- `$` → `%24`
- `#` → `%23`
- `@` → `%40`

Example:
```
postgresql://user:My%24Password@host:5432/db
```

### Step 5: Redeploy
After updating `DATABASE_URL` in Vercel:
1. Go to Deployments tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit

## 🔍 Test the Fix

### Option 1: Use Debug Endpoint
Visit: `https://shopcrazymarket.com/api/debug-database-url`

This will show:
- Current URL format
- Pattern matching results
- Prisma connection test
- Recommendations

### Option 2: Check Logs
After redeploy, check Vercel build logs for:
```
✅ Fixed DATABASE_URL in next.config.js (removed query params, encoded special chars)
```

## 📝 Common Issues

### Issue: Query Parameters
**Error:** Pattern mismatch  
**Fix:** Remove `?pgbouncer=true&sslmode=require` from URL

### Issue: Wrong Protocol
**Error:** Pattern mismatch  
**Fix:** Use `postgresql://` not `postgres://`

### Issue: Special Characters
**Error:** Pattern mismatch  
**Fix:** Encode special characters in password (`$` → `%24`)

### Issue: Quotes Around URL
**Error:** Pattern mismatch  
**Fix:** Remove quotes: `"postgresql://..."` → `postgresql://...`

## ✅ Checklist
- [ ] `DATABASE_URL` has no query parameters
- [ ] `DATABASE_URL` has no hash fragments
- [ ] `DATABASE_URL` has no surrounding quotes
- [ ] `DATABASE_URL` uses `postgresql://` protocol
- [ ] Password special characters are URL-encoded
- [ ] Redeployed after updating URL
- [ ] Tested with `/api/debug-database-url` endpoint

## 🆘 Still Not Working?

1. **Check Vercel Logs:**
   - Go to Deployments → Latest → Functions
   - Look for Prisma errors

2. **Test Locally:**
   - Copy your `DATABASE_URL` from Vercel
   - Test with: `npx prisma db pull` (should not error)

3. **Verify Supabase:**
   - Check Supabase Dashboard → Settings → Database
   - Verify connection string format
   - Ensure password is correct

4. **Contact Support:**
   - Share the error from `/api/debug-database-url`
   - Include Vercel deployment logs

