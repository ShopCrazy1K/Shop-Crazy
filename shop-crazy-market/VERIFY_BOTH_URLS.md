# ✅ Verify Both DATABASE_URL and DIRECT_URL

## Current Setup

You have both:
- `DATABASE_URL` - For connection pooling (queries)
- `DIRECT_URL` - For direct connection (migrations)

This is the **correct setup**! ✅

---

## What Each URL Should Be

### DATABASE_URL (Connection Pooling)
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Important:**
- ✅ Username: `postgres.hbufjpxdzmygjnbfsniu` (with project ref)
- ✅ Port: `6543` (pooling port)
- ✅ Host: `aws-1-us-east-2.pooler.supabase.com` (pooler)
- ❌ NO query parameters (`?pgbouncer=true&sslmode=require`)
- ❌ NO hash fragments

### DIRECT_URL (Direct Connection)
```
postgresql://postgres:Gotjuiceicemanbaby1@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Important:**
- ✅ Username: `postgres` (no project ref)
- ✅ Port: `5432` (direct port)
- ✅ Host: `db.hbufjpxdzmygjnbfsniu.supabase.co` (direct)
- ❌ NO query parameters
- ❌ NO hash fragments

---

## How to Verify in Vercel

1. **Go to:** Vercel → Settings → Environment Variables

2. **Check DATABASE_URL:**
   - Should be: `postgresql://postgres.hbufjpxdzmygjnbfsniu:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres`
   - Should NOT have: `?pgbouncer=true&sslmode=require`
   - Should end with: `/postgres` (nothing after)

3. **Check DIRECT_URL:**
   - Should be: `postgresql://postgres:Gotjuiceicemanbaby1@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres`
   - Should NOT have query parameters
   - Should end with: `/postgres` (nothing after)

4. **Both should have:**
   - ✅ All environments selected (Production, Preview, Development)
   - ✅ No quotes around the URLs
   - ✅ No spaces before or after

---

## If Authentication Still Fails

### Option 1: Verify Password in Supabase

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu
2. **Click:** Settings → Database
3. **Check:** Database password
4. **Verify:** It's exactly `Gotjuiceicemanbaby1`

If different:
- Update both URLs in Vercel with correct password
- Or reset password in Supabase to `Gotjuiceicemanbaby1`

### Option 2: Use Only Direct Connection

If pooling keeps failing, use direct connection for both:

1. **Set DATABASE_URL to:**
   ```
   postgresql://postgres:Gotjuiceicemanbaby1@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```

2. **Set DIRECT_URL to:**
   ```
   postgresql://postgres:Gotjuiceicemanbaby1@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```

3. **Redeploy**

---

## Test After Setup

1. **Visit:** `/api/test-database`
   - Should show `success: true`
   - Should show `prismaTest.success: true`

2. **Visit:** `/api/test-prisma-connection`
   - All 6 steps should pass ✅

3. **Try creating a listing:**
   - Should work without errors ✅

---

## Common Issues

### Issue 1: Query Parameters Still Present
**Symptom:** Pattern error or authentication fails
**Fix:** Remove `?pgbouncer=true&sslmode=require` from both URLs

### Issue 2: Wrong Username for Pooling
**Symptom:** Authentication fails with pooling URL
**Fix:** Username must be `postgres.hbufjpxdzmygjnbfsniu` (with project ref)

### Issue 3: Wrong Password
**Symptom:** Authentication fails
**Fix:** Verify password in Supabase matches exactly

### Issue 4: URLs Not Selected for All Environments
**Symptom:** Works in one environment but not others
**Fix:** Select all environments (Production, Preview, Development)

---

## Quick Checklist

- [ ] DATABASE_URL is set (pooling URL)
- [ ] DIRECT_URL is set (direct URL)
- [ ] Both URLs have no query parameters
- [ ] Both URLs have no hash fragments
- [ ] Both URLs have no quotes
- [ ] Both URLs have no spaces
- [ ] Password matches Supabase exactly
- [ ] All environments selected
- [ ] App has been redeployed

---

## The Code Automatically Cleans URLs

The Prisma client now automatically:
- ✅ Removes query parameters
- ✅ Removes hash fragments
- ✅ Removes quotes
- ✅ Trims whitespace

So even if your URLs have query parameters, the code will clean them automatically.

**But it's still better to remove them manually in Vercel!**

