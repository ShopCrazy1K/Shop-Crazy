# Vercel Deployment Checklist

## ✅ Code Changes Applied

All code changes have been committed and pushed:
- ✅ Fixed build script (removed hardcoded DATABASE_URL)
- ✅ Updated vercel.json configuration
- ✅ Fixed TypeScript errors
- ✅ Updated DATABASE_URL handling for PgBouncer

## 🔧 Required Vercel Configuration

### 1. Environment Variables (CRITICAL)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Set these variables for **Production**, **Preview**, and **Development**:

```
DATABASE_URL=postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Other required variables:**
- `NEXT_PUBLIC_SITE_URL` = `https://shopcrazymarket.com`
- `STRIPE_SECRET_KEY` = (your Stripe secret key)
- `STRIPE_WEBHOOK_SECRET` = (your Stripe webhook secret)
- `STRIPE_LISTING_FEE_PRICE_ID` = (your Stripe price ID)
- `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
- `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)

### 2. Verify Git Integration

1. Go to **Settings → Git**
2. Ensure:
   - ✅ Repository is connected
   - ✅ Production Branch = `main`
   - ✅ Auto-deploy is enabled

### 3. Check Deployment Status

1. Go to **Deployments** tab
2. Look for:
   - Latest deployment status
   - Build logs
   - Any error messages

### 4. Manual Deployment Trigger

If automatic deployment isn't working:

**Option A: Empty Commit**
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

**Option B: Vercel Dashboard**
1. Go to Deployments
2. Click "Redeploy" on latest deployment
3. Or click "Deploy" → "Deploy Latest Commit"

**Option C: Vercel CLI**
```bash
npx vercel --prod
```

## 🐛 Common Issues

### Issue: "Build failed"
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Check for TypeScript errors

### Issue: "No deployment triggered"
- Check GitHub webhook: GitHub → Settings → Webhooks
- Verify repository is connected in Vercel
- Try manual deployment trigger

### Issue: "Database connection error"
- Verify `DATABASE_URL` is set correctly
- Check password doesn't have unencoded special characters
- Ensure `pgbouncer=true` is in URL for pooler

### Issue: "Prisma Client not generated"
- Check `installCommand` in vercel.json includes `npx prisma generate`
- Verify Prisma schema is valid
- Check build logs for Prisma errors

## 📊 Verification Steps

1. ✅ Check Vercel Dashboard for new deployment
2. ✅ Review build logs for errors
3. ✅ Verify environment variables are set
4. ✅ Test the deployed site
5. ✅ Check database connection works

## 🆘 Still Not Working?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Review Build Logs**: Look for specific error messages
3. **Test Locally**: Run `npm run build` to catch errors early
4. **Contact Support**: Share specific error messages from build logs

## 📝 Recent Commits

These commits should trigger deployment:
- `b4f3efc` - Update next.config.js to preserve pgbouncer=true
- `3681e3b` - Fix duplicate installCommand in vercel.json
- `9cae795` - Fix build script to use environment DATABASE_URL

