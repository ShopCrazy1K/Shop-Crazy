# How to Verify DATABASE_URL is Set in Vercel

## Step 1: Check Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to: **Settings → Environment Variables**
4. Look for `DATABASE_URL` in the list
5. **Check that it's enabled for ALL environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Step 2: Verify the Value

Click on `DATABASE_URL` to edit it. The value should be exactly:

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:**
- ❌ No quotes around it
- ❌ No leading/trailing spaces
- ❌ No line breaks
- ✅ Starts with `postgresql://`
- ✅ Ends with `?pgbouncer=true`

## Step 3: Test After Deployment

After redeploying, visit this URL on your deployed site:

```
https://your-app.vercel.app/api/verify-env
```

This will show you:
- Whether `DATABASE_URL` exists
- The masked value (password hidden)
- Whether it starts with `postgresql://`
- All other DATABASE-related env vars

## Step 4: Common Issues

### Issue: "DATABASE_URL is not set" error

**Possible causes:**
1. **Not set at all** → Add it in Vercel Settings
2. **Only set for Production** → Enable for Preview and Development too
3. **Didn't redeploy** → You MUST manually redeploy after setting env vars
4. **Typo in variable name** → Should be exactly `DATABASE_URL` (case-sensitive)
5. **Extra spaces** → Check for leading/trailing spaces in the value

### Issue: Variable exists but still getting error

**Solutions:**
1. **Delete and re-add** the variable
2. **Clear build cache** in Vercel Settings → General
3. **Redeploy** manually from Deployments tab
4. **Check build logs** to see if the error is during build or runtime

## Step 5: Quick Test

Run this in your terminal (after deployment):

```bash
curl https://your-app.vercel.app/api/verify-env
```

You should see:
```json
{
  "databaseUrl": {
    "exists": true,
    "startsWithPostgresql": true
  }
}
```

If `exists: false`, the variable isn't set correctly.

## Still Not Working?

1. **Double-check the variable name** - it must be exactly `DATABASE_URL`
2. **Check all environments** - make sure Production, Preview, AND Development are checked
3. **Redeploy** - setting the variable doesn't auto-redeploy
4. **Clear cache** - Vercel Settings → General → Clear Build Cache
5. **Check build logs** - look for the exact error message

