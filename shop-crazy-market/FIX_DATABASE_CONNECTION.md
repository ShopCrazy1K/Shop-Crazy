# 🔧 Fix Database Connection Issue

If you have a database connection issue, follow these steps:

## Step 1: Verify DATABASE_URL in Vercel

1. Go to: https://vercel.com/dashboard
2. Your project → **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. **IMPORTANT:** Make sure it's checked for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. **Value should be:**
   ```
   postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```

## Step 2: Test Database Connection

After deployment, visit:
```
https://your-site.vercel.app/api/db-diagnose
```

This will show:
- ✅ If DATABASE_URL is configured
- ✅ If connection works
- ✅ Specific error messages
- ✅ How to fix it

## Step 3: Redeploy (REQUIRED!)

**Even if DATABASE_URL is set, you MUST redeploy:**

1. Go to: https://vercel.com/dashboard
2. Your project → **Deployments** → Latest deployment
3. Click **"..."** → **"Redeploy"**
4. **CRITICAL:** Uncheck ✅ **"Use existing Build Cache"**
5. Click **"Redeploy"**
6. Wait 2-3 minutes for completion

## Step 4: Test Again

After redeploy, visit:
```
https://your-site.vercel.app/api/db-diagnose
```

Should show `status: "ok"` if working.

## Common Issues & Fixes

### Issue 1: DATABASE_URL Not Applied
**Fix:** Make sure it's set for ALL environments and redeploy WITHOUT cache

### Issue 2: Connection Timeout
**Fix:** Try direct connection (port 5432) instead of pooler (port 6543)

### Issue 3: PgBouncer Error
**Fix:** Make sure `?pgbouncer=true` is in the URL, or try direct connection

### Issue 4: Authentication Failed
**Fix:** Check username/password in DATABASE_URL

## Quick Test URL

Visit this after redeploy:
```
https://your-site.vercel.app/api/db-diagnose
```

This tells you exactly what's wrong!
