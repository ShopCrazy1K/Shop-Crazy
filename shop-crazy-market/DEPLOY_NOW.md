# Quick Deployment Guide

## Automatic Deployment (Recommended)

If your Vercel project is connected to GitHub:
1. **Already Done!** - All code is pushed to GitHub
2. Vercel will automatically deploy when you push to `main` branch
3. Check your Vercel dashboard: https://vercel.com/dashboard

## Manual Deployment via CLI

If you need to deploy manually:

1. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Select your preferred login method (GitHub recommended)

2. **Link Project** (first time only):
   ```bash
   vercel link
   ```

3. **Deploy to Production**:
   ```bash
   vercel --prod --yes
   ```

## Deployment via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or go to "Settings" → "Git" to connect your repository

## What's Being Deployed

✅ All upload improvements:
- Drag-and-drop support
- Image reordering before upload
- Chunked uploads for large files (>50MB)
- Redis rate limiting (when configured)
- Image compression and optimization
- Progress tracking
- Parallel uploads

✅ All recent features:
- Health and Skin Care categories
- Forgot username/password
- Change password in profile
- Admin panel in navbar

## Environment Variables Needed

Make sure these are set in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SITE_URL` - Your site URL
- `RESEND_API_KEY` - For email (optional)
- `UPSTASH_REDIS_REST_URL` - For Redis rate limiting (optional)
- `UPSTASH_REDIS_REST_TOKEN` - For Redis rate limiting (optional)

## Post-Deployment Checklist

- [ ] Verify upload functionality works
- [ ] Test drag-and-drop uploads
- [ ] Test image reordering
- [ ] Test large file uploads (>50MB)
- [ ] Verify rate limiting is working
- [ ] Check that all environment variables are set
- [ ] Test payment flow
- [ ] Verify admin panel is accessible
