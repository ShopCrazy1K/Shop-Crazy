# 🔍 Diagnose Database Errors

## Quick Diagnostic Steps

### Step 1: Test Database Connection

Visit this URL on your deployed app:
```
https://your-app.vercel.app/api/test-database
```

**What to check:**
- `success: true` → Database is working ✅
- `success: false` → Check the `error` field for details

**Common errors:**
- `"DATABASE_URL is not set"` → Add it in Vercel
- `"The string did not match the expected pattern"` → URL format issue
- `"Cannot connect to database server"` → Network/connection issue
- `"Authentication failed"` → Wrong password

### Step 2: Check Detailed Connection Test

Visit:
```
https://your-app.vercel.app/api/test-prisma-connection
```

**What to check:**
- All steps should show `✅ Success`
- If any step fails, note which one:
  - Step 1: URL presence
  - Step 2: URL parsing
  - Step 3: Pattern matching
  - Step 4: PrismaClient creation
  - Step 5: Database connection
  - Step 6: Query execution

### Step 3: Check Debug Endpoint

Visit:
```
https://your-app.vercel.app/api/debug-database-url
```

**What to check:**
- `prismaPatternMatch.success: true`
- `prismaTest.success: true` (if present)
- `urlInfo.parsed.hostname` matches your Supabase host

### Step 4: Check Vercel Logs

1. Go to: **Vercel → Deployments → Latest → Functions → View Logs**
2. Look for:
   - `[Prisma]` messages
   - Error messages
   - Pattern validation errors
   - Connection errors

---

## Common Errors & Fixes

### Error 1: "DATABASE_URL is not set"
**Fix:**
1. Go to: Vercel → Settings → Environment Variables
2. Add `DATABASE_URL`
3. Redeploy

### Error 2: "The string did not match the expected pattern"
**Possible causes:**
- URL has quotes around it
- URL has spaces
- Password has special characters that need encoding
- Wrong URL format

**Fix:**
1. Check DATABASE_URL in Vercel
2. Ensure no quotes or spaces
3. Use exact format:
   ```
   postgresql://postgres.hbufjpxdzmygjnbfsniu:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres
   ```
4. Redeploy

### Error 3: "Cannot connect to database server"
**Possible causes:**
- Supabase database is paused
- Network/firewall issue
- Wrong host or port

**Fix:**
1. Check Supabase dashboard - ensure database is active
2. Try direct connection URL instead of pooling
3. Verify host and port are correct

### Error 4: "Authentication failed"
**Possible causes:**
- Wrong password
- Password encoding issue
- Wrong username

**Fix:**
1. Verify password in Supabase dashboard
2. Check password in DATABASE_URL matches exactly
3. Try resetting Supabase password

### Error 5: "PrismaClient is not configured"
**Fix:**
- This shouldn't happen with the new code
- Check Vercel logs for Prisma initialization errors

---

## What to Share for Help

If errors persist, share:

1. **Response from `/api/test-database`:**
   - Copy the full JSON response
   - Shows exact error and where it fails

2. **Response from `/api/test-prisma-connection`:**
   - Copy the full JSON response
   - Shows step-by-step where it fails

3. **Vercel Logs:**
   - Copy relevant `[Prisma]` messages
   - Copy any error messages

4. **What action you're trying:**
   - Creating a listing?
   - Signing up?
   - Viewing products?

5. **DATABASE_URL (first 50 chars, hide password):**
   - Just to verify format

---

## Quick Fix Checklist

- [ ] DATABASE_URL is set in Vercel
- [ ] DATABASE_URL has no quotes
- [ ] DATABASE_URL has no spaces
- [ ] Password is correct (Gotjuiceicemanbaby1)
- [ ] All environments selected (Production, Preview, Development)
- [ ] App has been redeployed after setting variables
- [ ] Supabase database is active (not paused)
- [ ] `/api/test-database` shows `success: true`

---

## Still Not Working?

1. **Try direct connection instead of pooling:**
   - Update DATABASE_URL to:
     ```
     postgresql://postgres:Gotjuiceicemanbaby1@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
     ```
   - Redeploy

2. **Check Supabase dashboard:**
   - Verify database is running
   - Check connection settings
   - Verify password is correct

3. **Share diagnostic info:**
   - Responses from test endpoints
   - Vercel logs
   - Specific error messages

