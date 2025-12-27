# Fix: "Environment variable not found: DATABASE_URL" During Prisma Generate

## The Problem

Prisma validates `DATABASE_URL` during `prisma generate`, which runs during the Vercel build. If `DATABASE_URL` isn't available during build, you'll see:

```
Invalid `prisma.listing.findUnique()` invocation:
error: Environment variable not found: DATABASE_URL.
--> schema.prisma:7
```

## The Solution

### Step 1: Verify DATABASE_URL is Set for Build

In Vercel, environment variables must be available during **build time**, not just runtime.

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Find `DATABASE_URL`
3. **CRITICAL:** Make sure it's enabled for:
   - ✅ **Production** (for production builds)
   - ✅ **Preview** (for preview/PR builds)
   - ✅ **Development** (for local builds)

### Step 2: The Value Should Be

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:**
- No quotes
- No spaces
- Starts with `postgresql://`
- Ends with `?pgbouncer=true`

### Step 3: Redeploy

After setting/verifying the variable:

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

### Step 4: Verify It's Working

After deployment, check the build logs. You should see:
- ✅ `prisma generate` completes successfully
- ✅ `next build` completes successfully
- ❌ No "Environment variable not found" errors

## Why This Happens

- `prisma generate` runs during `npm install` (postinstall) and during `next build`
- Prisma validates the `DATABASE_URL` format even though it doesn't connect
- If the variable isn't available during build, validation fails

## Still Not Working?

### Option 1: Clear Build Cache
1. Go to: **Settings → General**
2. Scroll to **"Clear Build Cache"**
3. Click it
4. Redeploy

### Option 2: Delete and Re-add Variable
1. Delete `DATABASE_URL` from Vercel
2. Add it again with the exact value
3. Make sure all environments are checked
4. Save
5. Redeploy

### Option 3: Check Build Logs
Look at the build logs to see:
- When `prisma generate` runs
- What environment variables are available
- The exact error message

## Test Locally

To test if it works locally:

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Try generating Prisma client
npx prisma generate

# Should complete without errors
```

If this works locally but not on Vercel, the issue is that Vercel doesn't have the variable set correctly.

