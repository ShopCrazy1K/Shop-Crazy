# Deployment Troubleshooting Guide

## Issue: Nothing is Deploying

If Vercel isn't deploying your changes, follow these steps:

### 1. Verify Git Push
✅ Commits are pushed to GitHub:
```bash
git log --oneline -5
```

### 2. Check Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your project (`shop-crazy-market` or `social-app`)
3. Check the "Deployments" tab
4. Look for:
   - Any failed deployments (red status)
   - Stuck deployments (in progress for >10 minutes)
   - Missing deployments (no new deployment after push)

### 3. Verify GitHub Integration
1. In Vercel Dashboard → Your Project → Settings → Git
2. Ensure:
   - ✅ Repository is connected
   - ✅ Branch is set to `main` (or your default branch)
   - ✅ Production Branch matches your Git branch

### 4. Check Build Logs
If there's a failed deployment:
1. Click on the failed deployment
2. Check the build logs for errors
3. Common issues:
   - TypeScript errors
   - Missing environment variables
   - Build timeout
   - Database connection issues

### 5. Manual Deployment Trigger
If automatic deployments aren't working:
1. In Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment
3. Or use Vercel CLI:
   ```bash
   npx vercel --prod
   ```

### 6. Check Webhook Status
1. Go to GitHub → Your Repository → Settings → Webhooks
2. Look for Vercel webhook
3. Check if it's:
   - ✅ Active (green checkmark)
   - ❌ Failed (red X) - click to see error details

### 7. Verify Environment Variables
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all required variables are set:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_LISTING_FEE_PRICE_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 8. Force a New Deployment
I've already triggered a new deployment with an empty commit. If it still doesn't deploy:

1. **Option A: Create another empty commit**
   ```bash
   git commit --allow-empty -m "Force deployment"
   git push
   ```

2. **Option B: Make a small change**
   ```bash
   echo "# Deployment trigger" >> DEPLOYMENT_TRIGGER.md
   git add DEPLOYMENT_TRIGGER.md
   git commit -m "Trigger deployment"
   git push
   ```

3. **Option C: Use Vercel CLI**
   ```bash
   npx vercel --prod
   ```

### 9. Check Vercel Status
Visit https://www.vercel-status.com/ to check if Vercel is experiencing any outages.

### 10. Contact Support
If none of the above works:
1. Check Vercel Dashboard for error messages
2. Review build logs for specific errors
3. Contact Vercel support with:
   - Project name
   - Deployment ID (if any)
   - Error messages from logs

## Recent Changes That Should Deploy

The following commits have been pushed and should trigger a deployment:

1. `d9a5e45` - Fix TypeScript error: remove unused timeoutId variable
2. `74bfce1` - Improve listing page error display and API timeout handling
3. `9e5f871` - Fix infinite loading on listing page with better error handling and timeouts
4. `f550797` - Add theme debug endpoint and force winter background with inline styles
5. `961b5a4` - Improve winter theme application and force white background
6. `acffac9` - Trigger Vercel deployment (empty commit)

## Next Steps

1. ✅ Check Vercel Dashboard for deployment status
2. ✅ Review any error messages in build logs
3. ✅ Verify GitHub webhook is active
4. ✅ Ensure environment variables are set
5. ✅ Wait 2-3 minutes for deployment to start

If deployments still aren't working, the issue is likely:
- Vercel webhook not connected to GitHub
- Build errors preventing deployment
- Vercel service outage

