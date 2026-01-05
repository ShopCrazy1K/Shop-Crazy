# 🔧 Add DATABASE_URL to Vercel

## Your DATABASE_URL

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

## Step-by-Step: Add to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Open Settings:**
   - Click "Settings" (left sidebar)
   - Click "Environment Variables"

3. **Add DATABASE_URL:**
   - Click "Add New"
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the URL above (the entire string)
   - **Environment:** Select ALL:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click "Save"

4. **Verify It's Added:**
   - Should see `DATABASE_URL` in the list
   - Should show "Production, Preview, Development" under it

5. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait for completion

## Verify It Works

After redeploying, test:

1. Visit: `/api/health-check`
   - Should show: `"database": { "configured": true, "connected": true }`

2. Visit: `/debug-runtime`
   - Should show all APIs working (green ✅)

3. Test listing click:
   - Go to marketplace
   - Click a listing
   - Should load correctly

4. Test notification bell:
   - Click the bell icon
   - Should open dropdown

## Important Notes

- ✅ URL format is correct (postgresql://, port 6543, pgbouncer=true)
- ✅ Password doesn't need encoding (no special chars)
- ⚠️ Make sure to add to ALL environments (Production, Preview, Development)
- ⚠️ After adding, you MUST redeploy for it to take effect

## If Still Not Working

1. Check health check: `/api/health-check`
2. If `connected: false`, verify DATABASE_URL is correct
3. Check Vercel Runtime Logs for errors
4. Verify database allows connections from Vercel IPs
