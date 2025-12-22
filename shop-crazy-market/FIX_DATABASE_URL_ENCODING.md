# Fix Database URL Encoding Error

## Problem
```
Error parsing connection string: invalid port number in database URL
```

## Root Cause
The password contains a `#` character, which is a special character in URLs and must be URL-encoded.

## Current (Incorrect) Connection String
```
postgresql://postgres:Icemanbaby1991#@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

The `#` in the password `Icemanbaby1991#` is being interpreted as a URL fragment, causing the parser to fail.

## Solution: URL-Encode the Password

The `#` character must be encoded as `%23`.

### Correct Connection String
```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

## How to Fix in Vercel

1. **Go to Environment Variables:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. **Find DATABASE_URL:**
   - Click the edit/pencil icon

3. **Update the Value:**
   - Replace: `Icemanbaby1991#`
   - With: `Icemanbaby1991%23`
   - Full string: `postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres`

4. **Save:**
   - Click "Save"

5. **Redeploy:**
   - Go to Deployments
   - Click "Redeploy" on latest deployment

## URL Encoding Reference

Special characters that need encoding in URLs:
- `#` → `%23`
- `@` → `%40` (if in password)
- `:` → `%3A` (if in password)
- `/` → `%2F` (if in password)
- `?` → `%3F` (if in password)
- `&` → `%26` (if in password)
- `%` → `%25` (if in password)
- `+` → `%2B` (if in password)
- ` ` (space) → `%20` or `+`

## Alternative: Use Supabase Connection Pooling

If you continue having issues, you can use Supabase's connection pooling URL instead:

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database
2. Under "Connection string" → "Connection pooling"
3. Copy the pooling URL (it handles encoding automatically)
4. Use that URL instead

## Verification

After updating:
- ✅ Build should complete successfully
- ✅ No "invalid port number" errors
- ✅ Database connection works at runtime

---

**Update DATABASE_URL in Vercel with the encoded password (`%23` instead of `#`) and redeploy!**

