# 🚀 Deployment Checklist

After adding environment variables to Vercel, follow this checklist:

## ✅ Pre-Deployment

- [x] Environment variables added to Vercel
- [ ] All required variables are set (see VERCEL_ENV_SETUP.md)
- [ ] Variables are set for correct environments (Production, Preview)

## 🔄 Deploy

1. **Redeploy Application:**
   - Go to: https://vercel.com/shop-crazy-markets-projects/social-app/deployments
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - OR push a new commit to trigger auto-deploy

2. **Watch Build Logs:**
   - Check for any build errors
   - Verify environment variables are loading
   - Look for missing variable warnings

## ✅ Post-Deployment Verification

### 1. Basic Functionality

- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] No console errors in browser

### 2. Database Connection

- [ ] Can view products/marketplace
- [ ] Can create a new listing
- [ ] Products save to database
- [ ] Can view product details

### 3. Authentication

- [ ] Can sign up new user
- [ ] Can log in
- [ ] Session persists
- [ ] Can log out

### 4. Stripe Integration

- [ ] Add items to cart
- [ ] Checkout button works
- [ ] Stripe checkout page loads
- [ ] Test payment with card: `4242 4242 4242 4242`
- [ ] Success page shows after payment
- [ ] Order is created in database

### 5. Webhook (Stripe)

- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Verify webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
- [ ] Check webhook events are being received
- [ ] Test with a payment and verify event appears

### 6. Email (If Configured)

- [ ] Submit a copyright report
- [ ] Check if admin email is received
- [ ] Verify email sender is correct

### 7. Supabase (If Using)

- [ ] Supabase client initializes without errors
- [ ] Can query Supabase tables (if using)
- [ ] Storage works (if using)

## 🔧 Configuration Updates

### Update NEXT_PUBLIC_SITE_URL

After first deployment, update with your actual domain:

1. Go to: Vercel → Settings → Environment Variables
2. Find `NEXT_PUBLIC_SITE_URL`
3. Update value to: `https://your-actual-domain.vercel.app`
4. Redeploy

### Update Stripe Webhook URL

1. Go to: https://dashboard.stripe.com/webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Verify webhook secret matches `STRIPE_WEBHOOK_SECRET` in Vercel

## 🐛 Common Issues

### Build Fails

- **Missing environment variable:** Check build logs for specific variable
- **Database connection:** Verify `DATABASE_URL` is correct
- **TypeScript errors:** Check for type mismatches

### Runtime Errors

- **"Missing Supabase key":** Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **"Stripe error":** Verify Stripe keys are correct (test vs live)
- **"Database error":** Check `DATABASE_URL` and database is accessible

### Webhook Not Working

- Verify webhook URL in Stripe matches your Vercel domain
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure webhook is enabled in Stripe

## 📊 Monitoring

### Vercel Analytics

- Check deployment logs
- Monitor function execution times
- Watch for errors in logs

### Stripe Dashboard

- Monitor payments
- Check webhook events
- Review failed payments

### Supabase Dashboard

- Check database connections
- Monitor query performance
- Review storage usage

## 🎯 Production Readiness

Before going fully live:

- [ ] Switch to Stripe **live** keys (not test keys)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Set up custom domain in Vercel
- [ ] Enable SSL/HTTPS
- [ ] Test all payment flows
- [ ] Verify email notifications work
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy for database
- [ ] Review security settings
- [ ] Test on mobile devices

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Application loads without errors
2. ✅ Users can sign up and log in
3. ✅ Products can be created and viewed
4. ✅ Checkout process completes successfully
5. ✅ Orders are saved to database
6. ✅ Webhooks are received by Stripe
7. ✅ Email notifications work (if configured)

---

**🎉 Once all checks pass, your application is ready for users!**

