# Fix DATABASE_URL Build Error

## Problem
Build fails with:
```
error: Environment variable not found: DATABASE_URL.
```

This happens because Prisma tries to connect during build, but `DATABASE_URL` isn't available.

## Solution 1: Set DATABASE_URL in Vercel (REQUIRED)

**This is the main fix!** You MUST set `DATABASE_URL` in Vercel environment variables.

### Steps:

1. **Go to Vercel Environment Variables:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. **Add/Verify DATABASE_URL:**
   - Key: `DATABASE_URL`
   - Value: `postgresql://postgres:Icemanbaby1991#@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres`
   - **IMPORTANT:** Select ALL environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **Save and Redeploy:**
   - Click "Save"
   - Go to Deployments
   - Click "Redeploy" on latest deployment

## Solution 2: Code Fix (Already Applied)

I've updated `lib/prisma.ts` to:
- Lazy-load Prisma client (only connects when actually used)
- Provide better error messages
- Handle build-time gracefully

## Why This Happens

During Next.js build:
1. Next.js runs `prisma generate` (needs DATABASE_URL for schema validation)
2. Prisma client is imported by admin pages
3. If DATABASE_URL isn't set, Prisma throws an error

## Verification

After setting DATABASE_URL in Vercel:

1. ✅ Build should complete successfully
2. ✅ No "Environment variable not found" errors
3. ✅ Prisma client initializes correctly at runtime

## Important Notes

- **DATABASE_URL must be set for ALL environments** (Production, Preview, Development)
- The connection string format must be correct
- Supabase database must be accessible (not paused)

## Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

For your project:
```
postgresql://postgres:Icemanbaby1991#@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

---

**After setting DATABASE_URL in Vercel, the build should succeed!**

