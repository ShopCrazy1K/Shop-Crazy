# ✅ Correct DATABASE_URL for Vercel

## Recommended Format (Use This)

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Why This Format?

1. **Protocol**: `postgresql://` (not `postgres://`)
2. **Username**: `postgres.hbufjpxdzmygjnbfsniu` (project ref format for pooler)
3. **Password**: `Puggyboy11281991` (no special characters, no encoding needed)
4. **Host**: `aws-1-us-east-2.pooler.supabase.com` (pooler hostname)
5. **Port**: `6543` (pooler port, not 5432)
6. **Database**: `postgres`
7. **Query**: `?pgbouncer=true` (required for pooler connections)

## Alternative Formats (Also Work)

### Without pgbouncer parameter
The code will automatically add `pgbouncer=true` if it detects `pooler.supabase.com`:
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### With all parameters
The code will clean extra parameters but keep `pgbouncer=true`:
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

## ❌ What NOT to Use

### Direct connection (not for Vercel)
```
postgresql://postgres:Puggyboy11281991@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```
- This uses direct connection (port 5432)
- Not recommended for serverless (Vercel)
- Can cause connection limit issues

### Wrong username format
```
postgresql://postgres:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```
- Missing `.hbufjpxdzmygjnbfsniu` in username
- Will cause authentication errors

## How to Set in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project

## How the Code Handles It

The code in `lib/prisma.ts` and `next.config.js` will:
1. ✅ Remove extra query parameters (`connection_limit`, `sslmode`)
2. ✅ Preserve `pgbouncer=true` for pooler URLs
3. ✅ Encode special characters in password (if any)
4. ✅ Clean whitespace and quotes

So you can use any of the formats above, and the code will normalize it correctly.

## Verification

After setting the environment variable, check:
1. Build logs in Vercel (should not show database connection errors)
2. Test endpoint: `https://your-site.vercel.app/api/test-database`
3. Check application logs for Prisma connection success

