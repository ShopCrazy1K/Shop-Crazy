# 🚨 Vercel Deployment Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Deployment Status

Go to your Vercel dashboard and check:
- **Status**: Is it "Building", "Failed", or "Ready"?
- **Build Logs**: Click on the deployment → "Build Logs" tab
- **Runtime Logs**: Check for runtime errors after deployment

### 2. Common Error Patterns

#### ❌ Build Failed: Prisma Generation Error
**Symptoms**: `Error: Prisma Client did not initialize yet`
**Solution**: 
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Check that DATABASE_URL format is correct (see below)
- Verify build command includes `prisma generate`

#### ❌ Build Failed: Missing Environment Variable
**Symptoms**: `process.env.DATABASE_URL is undefined` or similar
**Solution**: Add all required environment variables (see checklist below)

#### ❌ Build Failed: TypeScript Errors
**Symptoms**: Type errors in build logs
**Solution**: Run `npm run build` locally first to fix TypeScript errors

#### ❌ Runtime Error: Database Connection Failed
**Symptoms**: 500 errors, database connection timeout
**Solution**: Check DATABASE_URL format and ensure database is accessible

---

## ✅ Required Environment Variables Checklist

Add these to **Vercel → Settings → Environment Variables** (for **all environments**):

### Essential Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string (MUST be `postgresql://`, not `postgres://`)
- [ ] `NEXTAUTH_SECRET` - Random string (generate with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` - Your site URL (e.g., `https://shop-crazy-market.vercel.app`)

### Database & Prisma
- [ ] `DATABASE_URL` - Format: `postgresql://user:password@host:5432/database?pgbouncer=true`
  - ✅ Correct: `postgresql://postgres:password%24@db.xxx.supabase.co:5432/postgres`
  - ❌ Wrong: `postgres://...` (must be `postgresql://`)
  - ❌ Wrong: Contains unencoded special characters in password

### Stripe (if using payments)
- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (starts with `pk_`)

### Supabase (if using storage)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for server-side)

### Email (optional)
- [ ] `RESEND_API_KEY` - For email sending via Resend
- [ ] `EMAIL_FROM` - Email address for sending emails
- [ ] OR use SMTP:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`

### Redis (optional, for rate limiting)
- [ ] `REDIS_URL` - Redis connection URL
- [ ] OR `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Site Configuration
- [ ] `NEXT_PUBLIC_SITE_URL` - Full site URL (e.g., `https://shop-crazy-market.vercel.app`)
- [ ] `MARKETPLACE_NAME` - Your marketplace name

### Sentry (optional)
- [ ] `SENTRY_DSN` - Sentry DSN for error tracking
- [ ] `SENTRY_ORG` - Sentry organization
- [ ] `SENTRY_PROJECT` - Sentry project name

---

## 🔧 Fix Common Issues

### Issue 1: DATABASE_URL Format Error

**Error**: `The string did not match the expected pattern`

**Fix**:
1. URL must start with `postgresql://` (not `postgres://`)
2. Password must be URL-encoded:
   - `$` → `%24`
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
3. No extra spaces or quotes
4. For Supabase pooling, add `?pgbouncer=true` at the end

**Example**:
```
postgresql://postgres:Puggyboy1%24%24%24@db.xxx.supabase.co:5432/postgres?pgbouncer=true
```

**To encode password online**: https://www.urlencoder.org/

### Issue 2: Build Command Fails

**Check your `vercel.json`**:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

**If Prisma fails**:
- Ensure `DATABASE_URL` is set during build
- Check Prisma schema is valid: `npx prisma validate`
- Test locally: `prisma generate && npm run build`

### Issue 3: Next.js Build Errors

**Test locally first**:
```bash
cd shop-crazy-market
npm install
npm run build
```

**Fix any TypeScript or build errors locally before deploying.**

### Issue 4: Deployment Succeeds but App Doesn't Work

**Check**:
1. Runtime logs in Vercel dashboard
2. Browser console for client-side errors
3. API routes are accessible (e.g., `/api/health`)
4. Database connection works

---

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] All environment variables are set in Vercel
- [ ] `vercel.json` is configured correctly
- [ ] Build works locally: `npm run build`
- [ ] TypeScript compiles: `npm run type-check` (if available)
- [ ] Prisma schema is valid: `npx prisma validate`
- [ ] No TypeScript errors
- [ ] Git repository is connected to Vercel
- [ ] Auto-deploy is enabled (if desired)

---

## 🔍 How to Check Deployment Logs

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `shop-crazy-market`
3. **Click on the deployment** (the one that's failing)
4. **Check tabs**:
   - **Build Logs**: Errors during build
   - **Runtime Logs**: Errors at runtime
   - **Functions**: Serverless function logs

---

## 🚀 Manual Redeploy

If auto-deploy isn't working:

1. **Via Vercel Dashboard**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

2. **Via Git**:
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push
   ```

---

## 🆘 Still Not Working?

1. **Check Build Logs** - Look for the first error
2. **Check Runtime Logs** - Look for runtime errors
3. **Test API Routes** - Visit `/api/health` (if exists)
4. **Verify Environment Variables** - Double-check all are set
5. **Check Database Access** - Ensure database is accessible from Vercel

---

## 📞 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Deployment**: https://vercel.com/shop-crazy-markets-projects/shop-crazy-market/CLn5zF86yADQgMwyyrjQWTkBBN3Z
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🎯 Quick Fix Steps (Most Common)

1. **Go to Vercel → Settings → Environment Variables**
2. **Verify `DATABASE_URL` is set** (all environments)
3. **Check format**: Must be `postgresql://...` with URL-encoded password
4. **Click "Redeploy"** on the latest deployment
5. **Watch build logs** for errors
6. **Check runtime logs** after deployment

Most deployment failures are due to missing or incorrectly formatted environment variables!
