# Fix Authentication Error

## Error Message
```
Authentication failed against database server at `aws-1-us-east-2.pooler.supabase.com`, 
the provided database credentials for `postgres` are not valid.
```

## Problem
The error says `postgres` (without project ref), which means your DATABASE_URL in Vercel is missing the project reference in the username.

## Solution

### Step 1: Verify Current URL in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Check if the username is `postgres` or `postgres.hbufjpxdzmygjnbfsniu`

### Step 2: Correct URL Format

**❌ WRONG (will cause authentication error):**
```
postgresql://postgres:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**✅ CORRECT (for transaction pooler):**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### Step 3: Update in Vercel
1. Copy the CORRECT URL above
2. Paste it into Vercel's `DATABASE_URL` field
3. Make sure there are NO query parameters (`?pgbouncer=true&sslmode=require`)
4. Make sure the username is `postgres.hbufjpxdzmygjnbfsniu` (with the dot and project ref)
5. Save
6. Redeploy

### Step 4: Verify After Deployment
Visit: `https://your-app.vercel.app/api/debug-database-url`

Check the response:
- `urlInfo.parsed.username` should be `postgres.hbufjpxdzmygjnbfsniu`
- `prismaPatternMatch.username` should be `postgres.hbufjpxdzmygjnbfsniu`
- `prismaTest.success` should be `true`

## Key Points

1. **Username MUST include project ref for transaction pooler:**
   - ✅ `postgres.hbufjpxdzmygjnbfsniu`
   - ❌ `postgres`

2. **Port 6543 = Transaction Pooler:**
   - Requires: `postgres.<PROJECT_REF>` as username
   - Your project ref: `hbufjpxdzmygjnbfsniu`

3. **No Query Parameters:**
   - Remove: `?pgbouncer=true&sslmode=require`
   - URL should end with: `/postgres`

## Complete Correct URL
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Gotjuiceicemanbaby1@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

Copy this EXACTLY into Vercel (no spaces, no quotes, no query parameters).
